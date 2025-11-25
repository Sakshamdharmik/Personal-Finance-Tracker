import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req,file,cb) { // cb -> callback
        cb(null, './public/temp')
    },
    filename: function (req,file,cb) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
        const ext = path.extname(file.originalname)
        const uniqueName = `${file.fieldname}-${uniqueSuffix}${ext}`
        cb(null, uniqueName)
    }
})

export const upload = multer({storage: storage})