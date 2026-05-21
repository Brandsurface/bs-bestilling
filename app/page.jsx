import fs from 'fs'
import path from 'path'

export default function Home() {
  const filePath = path.join(process.cwd(), 'app', 'page.html')
  const html = fs.readFileSync(filePath, 'utf-8')

  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
  const headContent = headMatch ? headMatch[1] : ''

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  const bodyContent = bodyMatch ? bodyMatch[1] : html

  const combined = headContent + bodyContent

  return <div dangerouslySetInnerHTML={{ __html: combined }} />
}
