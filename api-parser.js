import puppeteer from 'puppeteer'
import fs from 'fs'

const [_1, _2, url] = process.argv
const baseUrl = 'https://www.vprok.ru'

if (!url) {
  console.error('No url or region')
  process.exit()
}

console.log('Начало работы скрипта')

const browser = await puppeteer.launch({headless: false})
const page = await browser.newPage()
await page.setViewport({width: 1080, height: 1024})

await page.goto(baseUrl)
console.log('Открытие старинцы')
await new Promise(resolve => setTimeout(resolve, 10_000))

const id = url.split('/').at(-2)

const data = await page.evaluate(async (id) => {
  const response = await fetch(
    `https://www.vprok.ru/web/api/v1/catalog/category/${id}?sort=popularity_desc&limit=30&page=1`,
    {method: 'POST', body: JSON.stringify({})}
  )

  return await response.json()
}, id);

let products = ''

for (const product of data.products) {
  products += `Название товара: ${product.name}\n`
  products += `Ссылка на страницу товара: ${baseUrl + product.url}\n`
  products += `Рейтинг: ${product.rating}\n`
  products += `Количество отзывов: ${product.reviews}\n`
  products += `Цена: ${product.price}\n`
  products += `Акционная цена: ${product.oldPrice ? product.price : 0}\n`
  products += `Цена до акции: ${product.oldPrice}\n`
  products += `Размер скидки: ${product.discount}\n`
  products += '---------------' + '\n'
}

fs.writeFile('products-api.txt', products, (err) => {
  if (!err) console.log('Файл создан');
})

await browser.close()