import puppeteer from 'puppeteer'
import fs from 'fs'

const [_1, _2, url, region] = process.argv

if (!url || !region) {
  console.error('No url or region')
  process.exit()
}

console.log('Начало работы скрипта')

const browser = await puppeteer.launch({headless: false})
const page = await browser.newPage()
await page.setViewport({width: 1080, height: 1024})

await page.goto(url)
console.log('Переход на страницу')

const buttonSelector = 'button[class*="Region_region"]'
await page.waitForSelector(buttonSelector)
await new Promise(resolve => setTimeout(resolve, 5000))
await page.locator(buttonSelector).click()
await page.locator(`button ::-p-text(${region})`).click()
await new Promise(resolve => setTimeout(resolve, 1000))
console.log('Смена региона')

await page.screenshot({ path: 'screenshot.jpg', fullPage: true });
console.log('Скриншот сделан')

const priceDiscountSelector = 'div[class*="ProductPage_buyBlockDesktop"] span[class*="Price_role_discount"]'
const priceOldSelector = 'div[class*="ProductPage_buyBlockDesktop"] span[class*="Price_role_old"]'
const priceRegularSelector = 'div[class*="ProductPage_buyBlockDesktop"] span[class*="Price_role_regular"]'

let price
let priceOld = '0'
let rating
let reviewCount

if (await page.$(priceRegularSelector)) {
  price = await page.$eval(priceRegularSelector, el => el.innerText)
} else {
  price = await page.$eval(priceDiscountSelector, el => el.innerText)
  priceOld = await page.$eval(priceOldSelector, el => el.innerText)
}

console.log('Цены собраны', price, priceOld)

const ratingSelector = 'div[class*="Summary_reviewsContainer"] div[class*="Summary_title"]'
const reviewCountSelector = 'div[class*="Summary_reviewsCountContainer"] div[class*="Summary_title"]'
rating = await page.$eval(ratingSelector, el => el.innerText)
reviewCount = await page.$eval(reviewCountSelector, el => el.innerText)

console.log('Рейтинг собран', rating, reviewCount)

fs.writeFile('product.txt', `price=${price.split(' ')[0]}
priceOld=${priceOld.split(' ')[0]}
rating=${rating}
reviewCount=${reviewCount}`, (err) => {
  if (!err) console.log('Файл создан');
})

await browser.close();