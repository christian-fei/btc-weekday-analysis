#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

main()

async function main () {
  const pathname = path.resolve(__dirname, 'btc-20190101-20191031.json')
  const contents = fs.readFileSync(pathname, 'utf8')

  const json = JSON.parse(contents)
  const closings = json.map(d => {
    const { time, close } = d
    const date = new Date(time).getDate()
    const day = new Date(time).getDay()
    return { date, day, close }
  })
  const countByDay = closings.reduce((acc, curr) => Object.assign(acc, {
    [curr.day]: (acc[curr.day] || 0) + 1
  }), {})
  const countByDate = closings.reduce((acc, curr) => Object.assign(acc, {
    [curr.date]: (acc[curr.date] || 0) + 1
  }), {})

  const countSumByDay = closings
    .reduce((acc, curr) => {
      const found = acc.find(a => a.day === curr.day)
      const updated = found || { day: curr.day, count: 0, sum: 0 }
      updated.count += 1
      updated.sum += curr.close
      if (found) return acc.map(a => a.day === curr.day ? updated : a)
      return acc.concat([updated])
    }, [])
    .map(d => Object.assign(d, { avg: d.sum / d.count }))

  const countSumByDate = closings
    .reduce((acc, curr) => {
      const found = acc.find(a => a.date === curr.date)
      const updated = found || { date: curr.date, count: 0, sum: 0 }
      updated.count += 1
      updated.sum += curr.close
      if (found) return acc.map(a => a.date === curr.date ? updated : a)
      return acc.concat([updated])
    }, [])
    .map(d => Object.assign(d, { avg: d.sum / d.count }))

  // process.stdout.write(JSON.stringify(countByDay, null, 2))
  // process.stdout.write(JSON.stringify(countByDate, null, 2))
  process.stdout.write(JSON.stringify(countSumByDay, null, 2))
  process.stdout.write(JSON.stringify(countSumByDate, null, 2))
  // const lowestDay = countSumByDay.
}
