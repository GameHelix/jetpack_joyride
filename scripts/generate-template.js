const XLSX = require('xlsx')
const fs = require('fs')
const path = require('path')

// Create a new workbook
const workbook = XLSX.utils.book_new()

// Define the template data with headers and example rows
const data = [
  ['name', 'email', 'role'],
  ['Ismat Samadov', 'ismetsemedov@gmail.com', 'STUDENT'],
  ['John Doe', 'john.doe@example.com', 'STUDENT'],
  ['Jane Smith', 'jane.smith@example.com', 'INSTRUCTOR'],
]

// Create worksheet from the data
const worksheet = XLSX.utils.aoa_to_sheet(data)

// Set column widths
worksheet['!cols'] = [
  { wch: 20 },  // name
  { wch: 30 },  // email
  { wch: 12 },  // role
]

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Users')

// Ensure the templates directory exists
const templatesDir = path.join(__dirname, '..', 'public', 'templates')
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true })
}

// Write the file
const filePath = path.join(templatesDir, 'bulk-user-import-template.xlsx')
XLSX.writeFile(workbook, filePath)

console.log(`✅ Template created successfully: ${filePath}`)
