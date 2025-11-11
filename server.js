
import express from "express"
import path from "path"
import { fileURLToPath } from "url"

const app = express()
const port = 3000



const __filename= fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static(path.join(__dirname, "public")))

app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from Node!" })
})

app.listen(port)


