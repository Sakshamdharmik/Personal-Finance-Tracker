import { useMemo } from 'react'
import './AnalyticsCharts.css'

const PieChart = ({ data, title, colors }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  let currentAngle = -90
  const radius = 80
  const centerX = 100
  const centerY = 100

  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100
    const angle = (percentage / 100) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle

    const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
    const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
    const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
    const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180)

    const largeArc = angle > 180 ? 1 : 0

    return {
      path: `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: colors[index % colors.length],
      label: item.label,
      value: item.value,
      percentage: percentage.toFixed(1)
    }
  })

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="pie-chart-wrapper">
        <svg viewBox="0 0 200 200" className="pie-chart">
          {segments.map((segment, index) => (
            <path
              key={index}
              d={segment.path}
              fill={segment.color}
              stroke="var(--bg-light)"
              strokeWidth="2"
              className="pie-segment"
            />
          ))}
        </svg>
        <div className="pie-legend">
          {segments.map((segment, index) => (
            <div key={index} className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: segment.color }}
              />
              <div className="legend-text">
                <span className="legend-label">{segment.label}</span>
                <span className="legend-value">
                  ${segment.value.toFixed(2)} ({segment.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const BarChart = ({ data, title, color }) => {
  const maxValue = Math.max(...data.map(item => item.value), 1)

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="bar-chart">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100
          return (
            <div key={index} className="bar-item">
              <div className="bar-wrapper">
                <div
                  className="bar"
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(180deg, ${color}, ${color}dd)`
                  }}
                  title={`${item.label}: $${item.value.toFixed(2)}`}
                />
              </div>
              <div className="bar-label">{item.label}</div>
              <div className="bar-value">${item.value.toFixed(2)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const LineChart = ({ data, title, color }) => {
  const maxValue = Math.max(...data.map(item => item.value), 1)
  const minValue = Math.min(...data.map(item => item.value), 0)
  const range = maxValue - minValue || 1

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * 100
    const y = 100 - ((item.value - minValue) / range) * 100
    return { x, y, value: item.value, label: item.label }
  })

  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="line-chart-wrapper">
        <svg viewBox="0 0 100 100" className="line-chart" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path
            d={`${pathData} L 100 100 L 0 100 Z`}
            fill={`url(#gradient-${title})`}
            className="area"
          />
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
            className="line"
          />
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="2"
              fill={color}
              className="point"
            />
          ))}
        </svg>
        <div className="line-chart-labels">
          {points.map((point, index) => (
            <div key={index} className="line-label">
              <span>{point.label}</span>
              <span>${point.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const AnalyticsCharts = ({ stats, transactions }) => {
  const incomeExpenseData = useMemo(() => {
    if (!stats) return []
    return [
      {
        label: 'Income',
        value: stats.income?.total || 0
      },
      {
        label: 'Expenses',
        value: stats.expense?.total || 0
      }
    ].filter(item => item.value > 0)
  }, [stats])

  const expenseCategoriesData = useMemo(() => {
    if (!stats?.expense?.categories) return []
    return stats.expense.categories
      .map(cat => ({
        label: cat.category,
        value: cat.total
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [stats])

  const incomeCategoriesData = useMemo(() => {
    if (!stats?.income?.categories) return []
    return stats.income.categories
      .map(cat => ({
        label: cat.category,
        value: cat.total
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [stats])

  const monthlyData = useMemo(() => {
    if (!transactions || transactions.length === 0) return []
    
    const monthly = {}
    transactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      
      if (!monthly[monthKey]) {
        monthly[monthKey] = { label: monthName, income: 0, expense: 0, key: monthKey }
      }
      
      if (transaction.type === 'income') {
        monthly[monthKey].income += transaction.amount
      } else {
        monthly[monthKey].expense += transaction.amount
      }
    })

    return Object.values(monthly)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6)
      .map(item => ({
        label: item.label,
        value: item.income - item.expense
      }))
  }, [transactions])

  const expenseColors = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'
  ]
  const incomeColors = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']

  const hasData = incomeExpenseData.length > 0 || expenseCategoriesData.length > 0 || 
                  incomeCategoriesData.length > 0 || monthlyData.length > 0

  if (!hasData) {
    return (
      <div className="analytics-charts">
        <div className="no-charts-data">
          <p>📊 Add transactions to see analytics and charts</p>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-charts">
      <div className="analytics-header">
        <h2>📊 Analytics & Insights</h2>
      </div>
      <div className="charts-grid">
        {incomeExpenseData.length > 0 && (
          <PieChart
            data={incomeExpenseData}
            title="Income vs Expenses"
            colors={['#10b981', '#ef4444']}
          />
        )}

        {expenseCategoriesData.length > 0 && (
          <PieChart
            data={expenseCategoriesData}
            title="Top Expense Categories"
            colors={expenseColors}
          />
        )}

        {incomeCategoriesData.length > 0 && (
          <BarChart
            data={incomeCategoriesData}
            title="Income by Category"
            color="#10b981"
          />
        )}

        {expenseCategoriesData.length > 0 && (
          <BarChart
            data={expenseCategoriesData}
            title="Expenses by Category"
            color="#ef4444"
          />
        )}

        {monthlyData.length > 0 && (
          <LineChart
            data={monthlyData}
            title="Monthly Balance Trend"
            color="#6366f1"
          />
        )}
      </div>
    </div>
  )
}

export default AnalyticsCharts

