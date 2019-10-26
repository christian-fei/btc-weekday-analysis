#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const sparkline = require('sparkline')

main()

async function main () {
  const pathname = path.resolve(__dirname, 'btc-20190101-20191031.json')
  const contents = fs.readFileSync(pathname, 'utf8')

  const json = JSON.parse(contents)
  const days = json.map(toDay).sort((d1, d2) => d1.time - d2.time)

  const weeks = days.reduce(splitWeeksArray, []).map(weekStats)

  // process.stdout.write('\n-- weeks\n')
  // process.stdout.write(JSON.stringify(weeks, null, 2))
  // const lowestCountByDayOfWeek = weeks.reduce(countByWeek('lowest'), {})
  // process.stdout.write('\n-- lowest\n')
  // process.stdout.write(JSON.stringify(lowestCountByDayOfWeek, null, 2))
  // const highestCountByDayOfWeek = weeks.reduce(countByWeek('highest'), {})
  // process.stdout.write('\n-- highest\n')
  // process.stdout.write(JSON.stringify(highestCountByDayOfWeek, null, 2))
  weeks.forEach((w, index, array) => {
    const previousAvg = array[index - 1] && array[index - 1].avg
    const change = previousAvg ? `\t${((w.avg - previousAvg) / 100).toFixed(1)}% \tprev: ${previousAvg.toFixed()} \tcurr: ${w.avg.toFixed(0)}` : ''
    process.stdout.write(
      `${w.from.substring(0, 10)} - ${w.to.substring(0, 10)} ` +
      sparkline(w.closings) +
      `\t ${change}` +
      `\t [${w.closings.map(c => parseInt(c)).join(', ')}]` +
      '\n')
  })
}

function toDay (d) {
  const { time, close } = d
  const date = new Date(time).getDate()
  const day = new Date(time).getDay()
  const iso = new Date(time).toISOString()
  return { time, iso, date, day, close }
}

function splitWeeksArray (weeks, curr) {
  const last = weeks[weeks.length - 1]
  if (!last) return weeks.concat([[curr]])
  const week = (curr.day === 0) ? [] : weeks[weeks.length - 1]
  if (curr.day === 0) weeks.push(week)
  if (!last) weeks.push(week)
  week.push(curr)
  week.sort((a, b) => a.time - b.time)
  return weeks
}

function weekStats (week) {
  const closings = week.map(d => d.close)
  const max = Math.max(...closings)
  const min = Math.min(...closings)
  const avg = closings.reduce((a, b) => a + b, 0) / week.length
  const above = closings.filter(c => c > avg).length
  const below = closings.filter(c => c < avg).length
  const from = new Date(week[0].time).toISOString()
  const to = new Date(week[week.length - 1].time).toISOString()
  const lowest = week.sort((a, b) => a.close - b.close)[0]
  const highest = week.sort((a, b) => b.close - a.close)[0]
  return { max, min, avg, above, below, from, to, closings, lowest, highest, sparkline: sparkline(closings) }
}

function countByWeek (type) {
  return (acc, curr) => {
    acc[curr[type].day] = acc[curr[type].day] || 0
    acc[curr[type].day]++
    return acc
  }
}
