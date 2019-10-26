#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

main()

function weekNumberFor (date) {
  const jan = new Date(date.getFullYear(), 0, 1)
  return Math.ceil((((date - jan) / 86400000) + jan.getDay() + 1) / 7)
}

async function main () {
  const pathname = path.resolve(__dirname, 'btc-20190101-20191031.json')
  const contents = fs.readFileSync(pathname, 'utf8')

  const dayList = JSON.parse(contents)

  const withWeek = dayList.map(({ time, close }) => {
    const date = new Date(time)
    return { time, date, close, week: weekNumberFor(date) }
  })

  const withAvg = withWeek.map(({ time, date, close, week }) => {
    const sameWeek = withWeek.filter(({ week: n }) => week === n)
    const weekAvg = sameWeek.reduce((a, b) => a + b.close, 0) / sameWeek.length
    const weekMax = Math.max(...sameWeek.map(d => d.close))
    const weekMin = Math.min(...sameWeek.map(d => d.close))

    return { time, date, close, week, weekAvg, weekMax, weekMin }
  })

  const stats = {
    days: 0,
    sun: {
      isAbove: 0,
      isBelow: 0,
      isMax: 0,
      isMin: 0
    },
    mon: {
      isAbove: 0,
      isBelow: 0,
      isMax: 0,
      isMin: 0
    },
    tue: {
      isAbove: 0,
      isBelow: 0,
      isMax: 0,
      isMin: 0
    },
    wed: {
      isAbove: 0,
      isBelow: 0,
      isMax: 0,
      isMin: 0
    },
    thr: {
      isAbove: 0,
      isBelow: 0,
      isMax: 0,
      isMin: 0
    },
    fri: {
      isAbove: 0,
      isBelow: 0,
      isMax: 0,
      isMin: 0
    },
    sat: {
      isAbove: 0,
      isBelow: 0,
      isMax: 0,
      isMin: 0
    }
  }

  withAvg.forEach(({ time, date, close, week, weekAvg, weekMax, weekMin }) => {
    const isAbove = close > weekAvg
    const weekNames = ['sun', 'mon', 'tue', 'wed', 'thr', 'fri', 'sat']

    if (isAbove) {
      stats[weekNames[date.getDay()]].isAbove += 1
    } else {
      stats[weekNames[date.getDay()]].isBelow += 1
    }

    if (weekMax) {
      stats[weekNames[date.getDay()]].isMax += 1
    }

    if (weekMin) {
      stats[weekNames[date.getDay()]].isMin += 1
    }

    stats.days += 1
  })

  console.log(stats)

  // const json = JSON.parse(contents)
  // const closings = json.map(d => {
  //   const { time, close } = d
  //   const date = new Date(time).getDate()
  //   const day = new Date(time).getDay()
  //   return { date, day, close }
  // })
  // const countByDay = closings.reduce((acc, curr) => Object.assign(acc, {
  //   [curr.day]: (acc[curr.day] || 0) + 1
  // }), {})
  // const countByDate = closings.reduce((acc, curr) => Object.assign(acc, {
  //   [curr.date]: (acc[curr.date] || 0) + 1
  // }), {})

  // const countSumByDay = closings
  //   .reduce((acc, curr) => {
  //     const found = acc.find(a => a.day === curr.day)
  //     const updated = found || { day: curr.day, count: 0, sum: 0 }
  //     updated.count += 1
  //     updated.sum += curr.close
  //     if (found) return acc.map(a => a.day === curr.day ? updated : a)
  //     return acc.concat([updated])
  //   }, [])
  //   .map(d => Object.assign(d, { avg: d.sum / d.count }))

  // const countSumByDate = closings
  //   .reduce((acc, curr) => {
  //     const found = acc.find(a => a.date === curr.date)
  //     const updated = found || { date: curr.date, count: 0, sum: 0 }
  //     updated.count += 1
  //     updated.sum += curr.close
  //     if (found) return acc.map(a => a.date === curr.date ? updated : a)
  //     return acc.concat([updated])
  //   }, [])
  //   .map(d => Object.assign(d, { avg: d.sum / d.count }))

  // // process.stdout.write(JSON.stringify(countByDay, null, 2))
  // // process.stdout.write(JSON.stringify(countByDate, null, 2))
  // process.stdout.write(JSON.stringify(countSumByDay, null, 2))
  // process.stdout.write(JSON.stringify(countSumByDate, null, 2))
  // // const lowestDay = countSumByDay.
}
