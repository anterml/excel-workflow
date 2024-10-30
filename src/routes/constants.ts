import type { Eng2Ru, ColumnTitle, Cell } from "./types"
import recordsData from './data/DBrecords'

export const SHOPS = [
  { value: 'Магазин1', id: crypto.randomUUID() },
  { value: 'Магазин2', id: crypto.randomUUID() },
  { value: 'Магазин3', id: crypto.randomUUID() },
  { value: 'Магазин4', id: crypto.randomUUID() },
]

export const SITES = [
  { value: 'сайт1', id: crypto.randomUUID() },
  { value: 'сайт2', id: crypto.randomUUID() },
  { value: 'сайт3', id: crypto.randomUUID() },
  { value: 'сайт4', id: crypto.randomUUID() },
]

export const Fields = {
  record: [
    'productName',
    'source',
    'paymentMethod',
    'producer',
    'creator',
  ],

  number: [
    'price',
    'count',
    'servicePrice'
  ],

  date: [
    'createdAt',
    'deliveredAt',
  ],

  disabled: [
    'sum'
  ]
}

export const eng2ru: Eng2Ru = {
  'createdAt': 'Дата заявки',
  'deliveredAt': 'Дата доставки',
  'customer': 'Заказчик',
  'productName': 'Товар',
  'price': 'Цена',
  'count': 'Кол-во',
  'servicePrice': 'Услуги',
  'sum': 'Сумма',
  'source': 'Источник',
  'paymentMethod': 'Оплата',
  'address': 'Адрес',
  'phone': 'Телефон',
  'leisure': 'Время',
  'comment': 'Комментарий',
  'producer': 'Поставщик',
  'creator': 'Автор',
  'invoice1': 'Счет на оплату',
  'invoice2': 'Счет на фактуру',
}

const createdAtId: string[] = []
for(let i = 1; i <= 7; ++i)
  createdAtId.push(crypto.randomUUID())

const deliveredAtId: string[] = []
for(let i = 7; i <= 14; ++i)
  deliveredAtId.push(crypto.randomUUID())

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomCreateDate(days: number) {
  const date = Date.now()
  return {
    value: (new Date(date + 1000 * 60 * 60 * 24 * days)).toLocaleDateString().trim(),
    id: createdAtId[days - 1],
  }
}

function randomDeliveryDate(days: number) {
  const date = Date.now()
  return {
    value: (new Date(date + 1000 * 60 * 60 * 24 * days)).toLocaleDateString().trim(),
    id: deliveredAtId[days - 7],
  }
}

const getLeisure = (() => {
  const buff: Record<string, { value: string, id: string }> = {}
  return () => {
    const value = `${random(10, 13)}-${random(14, 20)}`
    if(!buff[value])
      buff[value] = { value, id: crypto.randomUUID() }
    return buff[value]
  }
})();

export function generateData() {
  const buff: { id: string, value: Record<ColumnTitle, Cell> }[] = []
  for(let i = 1; i < 100; ++i) {
    const price = { value: random(12500, 45000), id: crypto.randomUUID() }
    const count = { value: i % 15 === 0 ? 2 : 1, id: crypto.randomUUID() }
    const servicePrice = { value: random(0, 3500), id: crypto.randomUUID() }
    const sum = { value: price.value * count.value + servicePrice.value, id: crypto.randomUUID() }

    const productName = recordsData.productName[random(0, recordsData.productName.length - 1)]
    const source = recordsData.source[random(0, recordsData.source.length - 1)]
    const paymentMethod = recordsData.paymentMethod[random(0, recordsData.paymentMethod.length - 1)]
    const creator = recordsData.creator[random(0, recordsData.creator.length - 1)]
    const producer = recordsData.producer[random(0, recordsData.producer.length - 1)]
    
    const item: Record<ColumnTitle, Cell> = {
      'createdAt': randomCreateDate(random(1, 7)),
      'deliveredAt': randomDeliveryDate(random(7, 14)),
      'customer': { value: 'Заказчик' + i, id: crypto.randomUUID() },
      'productName': { id: crypto.randomUUID(), value: productName.id, type: 'record' },
      
      price,
      count,
      servicePrice,
      sum,

      'paymentMethod': { id: crypto.randomUUID(), value: paymentMethod.id, type: 'record' },
      'source': { id: crypto.randomUUID(), value: source.id, type: 'record' },
      'creator': { id: crypto.randomUUID(), value: creator.id, type: 'record' },
      'producer': { id: crypto.randomUUID(), value: producer.id, type: 'record' },

      'address': { value: 'Адрес' + i, id: crypto.randomUUID() },
      'phone': {
        value: `89${random(0, 9)}${random(0, 9)} ${random(0, 9)}${random(0, 9)}${random(0, 9)} ${random(0, 9)}${random(0, 9)} ${random(0, 9)}${random(0, 9)}`,
        id: crypto.randomUUID()
      },
      'leisure': getLeisure(),
      'comment': { value: 'Комментарий' + i, id: crypto.randomUUID() },
      'invoice1': { value: 'Счет на оплату' + i, id: crypto.randomUUID() },
      'invoice2': { value: 'Счет на фактуру' + i, id: crypto.randomUUID() },
    }

    buff.push({
      id: crypto.randomUUID() as string,
      value: item,
    })
  }
  return buff.toSorted((a, b) => {
    if(a.value.createdAt.value < b.value.createdAt.value)
      return -1
    return a.value.createdAt.value ===  b.value.createdAt.value ? 0 : 1
  })
}
