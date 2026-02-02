import React, { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Calculator, Home, Building, DollarSign, Zap, Leaf, TrendingUp, BarChart3, Battery, Shield, CheckCircle2, Clock } from 'lucide-react'

// Chart Components
const CapexComparisonChart = ({ data }) => {
  const systems = Object.entries(data).sort(([,a], [,b]) => a - b)
  const maxCost = Math.max(...Object.values(data))
  const minCost = Math.min(...Object.values(data))
  
  // SVG dimensions for horizontal bar chart
  const svgWidth = 400
  const svgHeight = 220
  const barHeight = 40
  const barGap = 15
  const labelWidth = 80
  const valueWidth = 60
  
  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-gray-900">System Cost Comparison</h4>
      
      {/* Horizontal Bar Chart */}
      <div className="bg-gray-50 rounded-lg p-4">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full">
          {systems.map(([system, cost], index) => {
            const barWidth = ((cost / maxCost) * (svgWidth - labelWidth - valueWidth - 40)) + 40 // Min 40px
            const y = index * (barHeight + barGap) + 20
            const isGeothermal = system === 'Geothermal'
            const shortName = system.replace(' + AC', '').replace('Natural Gas', 'Gas')
            
            return (
              <g key={system}>
                {/* System label */}
                <text
                  x={labelWidth - 5}
                  y={y + barHeight / 2 + 5}
                  textAnchor="end"
                  className="text-xs font-medium"
                  fill="#374151"
                >
                  {shortName}
                </text>
                
                {/* Bar background */}
                <rect
                  x={labelWidth}
                  y={y}
                  width={svgWidth - labelWidth - valueWidth - 20}
                  height={barHeight}
                  rx="6"
                  fill="#e5e7eb"
                />
                
                {/* Colored bar */}
                <rect
                  x={labelWidth}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="6"
                  fill={isGeothermal ? "url(#geoGradient)" : "url(#altGradient)"}
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                />
                
                {/* Cost value */}
                <text
                  x={labelWidth + barWidth + 10}
                  y={y + barHeight / 2 + 5}
                  textAnchor="start"
                  className="text-sm font-bold"
                  fill={isGeothermal ? "#059669" : "#4b5563"}
                >
                  ${Math.round(cost / 1000)}K
                </text>
                
                {/* Best value badge for lowest cost */}
                {index === 0 && (
                  <g>
                    <rect
                      x={labelWidth + barWidth - 70}
                      y={y + 8}
                      width={60}
                      height={24}
                      rx="12"
                      fill={isGeothermal ? "#dcfce7" : "#f3f4f6"}
                      stroke={isGeothermal ? "#22c55e" : "#9ca3af"}
                      strokeWidth="1"
                    />
                    <text
                      x={labelWidth + barWidth - 40}
                      y={y + 24}
                      textAnchor="middle"
                      className="text-xs font-semibold"
                      fill={isGeothermal ? "#15803d" : "#4b5563"}
                    >
                      BEST
                    </text>
                  </g>
                )}
              </g>
            )
          })}
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="geoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#4ade80" />
            </linearGradient>
            <linearGradient id="altGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6b7280" />
              <stop offset="100%" stopColor="#9ca3af" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm text-green-700 font-medium">Geothermal</div>
          <div className="text-2xl font-bold text-green-800">
            ${Math.round(data.Geothermal / 1000)}K
          </div>
          <div className="text-xs text-green-600">After incentives</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-700 font-medium">Avg Alternative</div>
          <div className="text-2xl font-bold text-gray-800">
            ${Math.round(Object.values(data).filter((_, i) => Object.keys(data)[i] !== 'Geothermal').reduce((a, b) => a + b, 0) / (Object.keys(data).length - 1) / 1000)}K
          </div>
          <div className="text-xs text-gray-600">Before any rebates</div>
        </div>
      </div>
    </div>
  )
}

const ROIChart = ({ data }) => {
  // Extended timeline for GSHP vs other systems
  const years = [0, 5, 10, 15, 20, 25, 30]
  const dataPoints = years.map(year => ({
    year,
    savings: year === 0 ? -data.netCost : (data.cumulativeSavings * year) - data.netCost,
    cumulativeSavings: year === 0 ? 0 : data.cumulativeSavings * year
  }))
  
  // Find break-even point
  const breakEvenYear = data.netCost / data.cumulativeSavings
  const maxValue = Math.max(...dataPoints.map(p => p.savings), 0)
  const minValue = Math.min(...dataPoints.map(p => p.savings), 0)
  const range = maxValue - minValue || 1
  
  // SVG dimensions
  const svgWidth = 700
  const svgHeight = 280
  const padding = { top: 40, right: 40, bottom: 50, left: 60 }
  const chartWidth = svgWidth - padding.left - padding.right
  const chartHeight = svgHeight - padding.top - padding.bottom
  
  // Calculate pixel positions
  const getX = (index) => padding.left + (index / (dataPoints.length - 1)) * chartWidth
  const getY = (value) => {
    const normalizedValue = (value - minValue) / range
    return padding.top + chartHeight - (normalizedValue * chartHeight)
  }
  const zeroY = getY(0)
  
  // Create smooth curve path
  const createCurvePath = () => {
    const points = dataPoints.map((point, index) => ({
      x: getX(index),
      y: getY(point.savings)
    }))
    
    // Create smooth bezier curve
    let path = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const tension = 0.3
      const cp1x = prev.x + (curr.x - prev.x) * tension
      const cp1y = prev.y
      const cp2x = curr.x - (curr.x - prev.x) * tension
      const cp2y = curr.y
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
    }
    return path
  }
  
  // Create area path (for fill under curve)
  const createAreaPath = () => {
    const points = dataPoints.map((point, index) => ({
      x: getX(index),
      y: getY(point.savings)
    }))
    
    let path = `M ${points[0].x} ${zeroY}`
    path += ` L ${points[0].x} ${points[0].y}`
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const tension = 0.3
      const cp1x = prev.x + (curr.x - prev.x) * tension
      const cp1y = prev.y
      const cp2x = curr.x - (curr.x - prev.x) * tension
      const cp2y = curr.y
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
    }
    
    path += ` L ${points[points.length - 1].x} ${zeroY} Z`
    return path
  }
  
  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-gray-900">Return on Investment Timeline</h4>
      
      {/* Simple Line Graph */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {/* Chart Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">Cumulative Cash Flow Over Time</div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Investment Period</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Profit Period</span>
            </div>
          </div>
        </div>
        
        {/* SVG Line Chart */}
        <div className="w-full overflow-x-auto">
          <svg 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
            className="w-full min-w-[500px]"
            style={{ maxHeight: '320px' }}
          >
            <defs>
              <linearGradient id="lineGradientNew" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset={`${Math.min((breakEvenYear / 30) * 100, 100)}%`} stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="areaGradientPositive" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="areaGradientNegative" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            
            {/* Background grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line
                key={i}
                x1={padding.left}
                y1={padding.top + chartHeight * ratio}
                x2={svgWidth - padding.right}
                y2={padding.top + chartHeight * ratio}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
            
            {/* Zero line */}
            <line
              x1={padding.left}
              y1={zeroY}
              x2={svgWidth - padding.right}
              y2={zeroY}
              stroke="#374151"
              strokeWidth="2"
              strokeDasharray="6,4"
            />
            
            {/* Area fill (split by positive/negative) */}
            <path
              d={createAreaPath()}
              fill="url(#areaGradientPositive)"
              clipPath="url(#positiveClip)"
            />
            
            {/* Smooth curve line */}
            <path
              d={createCurvePath()}
              fill="none"
              stroke="url(#lineGradientNew)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            />
            
            {/* Data points with labels */}
            {dataPoints.map((point, index) => {
              const x = getX(index)
              const y = getY(point.savings)
              const isPositive = point.savings >= 0
              
              return (
                <g key={index}>
                  {/* Vertical dashed line to zero */}
                  <line
                    x1={x}
                    y1={y}
                    x2={x}
                    y2={zeroY}
                    stroke={isPositive ? "#10b981" : "#ef4444"}
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.4"
                  />
                  
                  {/* Point circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill={isPositive ? "#10b981" : "#ef4444"}
                    stroke="white"
                    strokeWidth="3"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                  />
                  
                  {/* Value label */}
                  <text
                    x={x}
                    y={isPositive ? y - 16 : y + 24}
                    textAnchor="middle"
                    className="text-xs font-bold"
                    fill={isPositive ? "#059669" : "#dc2626"}
                  >
                    {isPositive ? '+' : ''}${Math.round(point.savings / 1000)}K
                  </text>
                </g>
              )
            })}
            
            {/* Break-even indicator */}
            {breakEvenYear <= 30 && (
              <>
                <line
                  x1={getX(breakEvenYear / 5)}
                  y1={padding.top}
                  x2={getX(breakEvenYear / 5)}
                  y2={svgHeight - padding.bottom}
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="6,4"
                />
                <rect
                  x={getX(breakEvenYear / 5) - 55}
                  y={padding.top - 5}
                  width="110"
                  height="24"
                  rx="4"
                  fill="#fef3c7"
                  stroke="#f59e0b"
                  strokeWidth="1"
                />
                <text
                  x={getX(breakEvenYear / 5)}
                  y={padding.top + 12}
                  textAnchor="middle"
                  className="text-xs font-semibold"
                  fill="#92400e"
                >
                  Break-even: {breakEvenYear.toFixed(1)}yr
                </text>
              </>
            )}
            
            {/* X-axis labels */}
            {years.map((year, index) => (
              <text
                key={year}
                x={getX(index)}
                y={svgHeight - 15}
                textAnchor="middle"
                className="text-xs"
                fill="#6b7280"
              >
                Year {year}
              </text>
            ))}
            
            {/* Y-axis labels */}
            <text x={padding.left - 10} y={padding.top + 5} textAnchor="end" className="text-xs" fill="#6b7280">
              ${Math.round(maxValue / 1000)}K
            </text>
            <text x={padding.left - 10} y={zeroY + 4} textAnchor="end" className="text-xs font-medium" fill="#374151">
              $0
            </text>
            <text x={padding.left - 10} y={svgHeight - padding.bottom} textAnchor="end" className="text-xs" fill="#6b7280">
              ${Math.round(minValue / 1000)}K
            </text>
          </svg>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="group text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="text-sm text-red-700 font-medium mb-1">Initial Investment</div>
            <div className="text-2xl font-bold text-red-800">${Math.round(data.netCost / 1000)}K</div>
            <div className="text-xs text-red-600 mt-1">After incentives</div>
          </div>
          <div className="group text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="text-sm text-blue-700 font-medium mb-1">Annual Savings</div>
            <div className="text-2xl font-bold text-blue-800">${Math.round(data.cumulativeSavings / 1000)}K</div>
            <div className="text-xs text-blue-600 mt-1">Every year</div>
          </div>
          <div className="group text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div className="text-sm text-green-700 font-medium mb-1">30-Year Return</div>
            <div className="text-2xl font-bold text-green-800">
              ${Math.round(dataPoints[dataPoints.length - 1].savings / 1000)}K
            </div>
            <div className="text-xs text-green-600 mt-1">Total profit</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const LifetimeCostChart = ({ data }) => {
  // Calculate costs with 5% annual inflation on electricity (applies to both geo and traditional)
  const calcInflatedCost = (annualCost, years) => {
    let total = 0
    for (let i = 0; i < years; i++) {
      total += annualCost * Math.pow(1.05, i)
    }
    return total
  }
  
  // Geo also uses electricity (just less) - apply 5% inflation to geo's electric costs too
  const geo10Year = data.geothermal.upfrontCost + calcInflatedCost(data.geothermal.annualCost, 10)
  const geo30Year = data.geothermal.upfrontCost + calcInflatedCost(data.geothermal.annualCost, 30)
  
  // Traditional: fuel + electric + maintenance ($200/yr base, all with 5% inflation)
  const tradAnnualWithMaint = data.conventional.annualCost + 200
  const trad10Year = data.conventional.upfrontCost + calcInflatedCost(tradAnnualWithMaint, 10)
  const trad30Year = data.conventional.upfrontCost + calcInflatedCost(tradAnnualWithMaint, 30) + data.conventional.replacementCost
  
  const comparisons = [
    {
      label: '10-Year Total Cost',
      sublabel: 'Install + Operating (5% electric inflation)',
      geo: geo10Year,
      trad: trad10Year,
      color: 'amber'
    },
    {
      label: '30-Year Total Cost',
      sublabel: 'Including replacement + inflation',
      geo: geo30Year,
      trad: trad30Year,
      color: 'green'
    }
  ]
  
  const maxCost = Math.max(geo10Year, geo30Year, trad10Year, trad30Year)
  
  // SVG dimensions
  const svgWidth = 450
  const barHeight = 32
  const barGap = 8
  const sectionGap = 30
  const labelWidth = 100
  const valueWidth = 70
  const chartWidth = svgWidth - labelWidth - valueWidth - 20
  
  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-gray-900">10 & 30-Year Total Cost Comparison</h4>
      <p className="text-xs text-gray-500">Both systems include 5% annual inflation. Traditional includes maintenance ($200/yr base + inflation).</p>
      
      {/* Horizontal Bar Chart */}
      <div className="bg-gray-50 rounded-lg p-4">
        {comparisons.map((comp, compIdx) => {
          const geoWidth = Math.max((comp.geo / maxCost) * chartWidth, 40)
          const tradWidth = Math.max((comp.trad / maxCost) * chartWidth, 40)
          const savings = comp.trad - comp.geo
          const savingsPercent = Math.round((savings / comp.trad) * 100)
          
          return (
            <div key={compIdx} className={compIdx > 0 ? 'mt-6 pt-6 border-t border-gray-200' : ''}>
              {/* Section Header */}
              <div className="flex justify-between items-center mb-3">
                <div>
                  <div className="font-semibold text-gray-800">{comp.label}</div>
                  <div className="text-xs text-gray-500">{comp.sublabel}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  comp.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                }`}>
                  Save ${Math.round(savings / 1000)}K ({savingsPercent}%)
                </div>
              </div>
              
              <svg viewBox={`0 0 ${svgWidth} ${(barHeight + barGap) * 2 + 10}`} className="w-full">
                <defs>
                  <linearGradient id={`geoGrad${compIdx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#4ade80" />
                  </linearGradient>
                  <linearGradient id={`tradGrad${compIdx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#f87171" />
                  </linearGradient>
                </defs>
                
                {/* Geothermal Bar */}
                <g>
                  <text x={labelWidth - 8} y={barHeight / 2 + 5} textAnchor="end" className="text-xs font-medium" fill="#374151">
                    Geothermal
                  </text>
                  <rect x={labelWidth} y={0} width={chartWidth} height={barHeight} rx="6" fill="#e5e7eb" />
                  <rect x={labelWidth} y={0} width={geoWidth} height={barHeight} rx="6" fill={`url(#geoGrad${compIdx})`} 
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                  <text x={labelWidth + geoWidth + 8} y={barHeight / 2 + 5} textAnchor="start" className="text-sm font-bold" fill="#15803d">
                    ${Math.round(comp.geo / 1000)}K
                  </text>
                </g>
                
                {/* Traditional Bar */}
                <g transform={`translate(0, ${barHeight + barGap})`}>
                  <text x={labelWidth - 8} y={barHeight / 2 + 5} textAnchor="end" className="text-xs font-medium" fill="#374151">
                    {data.conventional.name.replace(' + AC', '').replace('Furnace', '')}
                  </text>
                  <rect x={labelWidth} y={0} width={chartWidth} height={barHeight} rx="6" fill="#e5e7eb" />
                  <rect x={labelWidth} y={0} width={tradWidth} height={barHeight} rx="6" fill={`url(#tradGrad${compIdx})`}
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                  <text x={labelWidth + tradWidth + 8} y={barHeight / 2 + 5} textAnchor="start" className="text-sm font-bold" fill="#dc2626">
                    ${Math.round(comp.trad / 1000)}K
                  </text>
                </g>
              </svg>
            </div>
          )
        })}
      </div>
      
      {/* Cost Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm font-medium text-green-800 mb-2">Geothermal GSHP</div>
          <div className="space-y-1 text-xs text-green-700">
            <div className="flex justify-between">
              <span>Initial Cost:</span>
              <span>${Math.round(data.geothermal.upfrontCost / 1000)}K</span>
            </div>
            <div className="flex justify-between">
              <span>Annual Electric (yr 1):</span>
              <span>${Math.round(data.geothermal.annualCost).toLocaleString()}/yr</span>
            </div>
            <div className="flex justify-between">
              <span>Electric Inflation:</span>
              <span>5%/yr</span>
            </div>
            <div className="flex justify-between">
              <span>Lifespan:</span>
              <span>30+ years</span>
            </div>
            <hr className="border-green-300" />
            <div className="flex justify-between font-semibold">
              <span>30-Year Total:</span>
              <span>${Math.round(geo30Year / 1000)}K</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="text-sm font-medium text-red-800 mb-2">{data.conventional.name}</div>
          <div className="space-y-1 text-xs text-red-700">
            <div className="flex justify-between">
              <span>Initial Cost:</span>
              <span>${Math.round(data.conventional.upfrontCost / 1000)}K</span>
            </div>
            <div className="flex justify-between">
              <span>Annual Fuel+Elec (yr 1):</span>
              <span>${Math.round(data.conventional.annualCost).toLocaleString()}/yr</span>
            </div>
            <div className="flex justify-between">
              <span>Annual Maint (yr 1):</span>
              <span>$200/yr</span>
            </div>
            <div className="flex justify-between">
              <span>Replace @15yr:</span>
              <span>${Math.round(data.conventional.replacementCost / 1000)}K</span>
            </div>
            <hr className="border-red-300" />
            <div className="flex justify-between font-semibold">
              <span>30-Year Total:</span>
              <span>${Math.round(trad30Year / 1000)}K</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Savings Summary */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-center">
          <div className="text-sm font-medium text-blue-800">30-Year Lifetime Savings</div>
          <div className="text-2xl font-bold text-blue-600">
            ${Math.round((trad30Year - geo30Year) / 1000)}K
          </div>
          <div className="text-xs text-blue-700">
            Geothermal saves {Math.round(((trad30Year - geo30Year) / trad30Year) * 100)}% over conventional systems
          </div>
        </div>
      </div>
    </div>
  )
}

// 3-Milestone Comparison: Install, 10-Year, 30-Year
const ThreeMilestoneComparison = ({ data }) => {
  // Calculate costs with 5% annual inflation for traditional
  const calcInflatedCost = (annualCost, years) => {
    let total = 0
    for (let i = 0; i < years; i++) {
      total += annualCost * Math.pow(1.05, i)
    }
    return total
  }
  
  // Traditional: fuel + electric + maintenance ($200/yr base, all with 5% inflation)
  const tradAnnualTotal = (data.tradAnnualFuel || 0) + (data.tradAnnualElectric || 0) + 200
  
  // Geo with solar uses minimal electricity - also apply 5% inflation
  const geoAnnual = data.geoAnnualOperating || 500
  
  // Recalculate with proper inflation for both systems
  const geo10YearWithInflation = data.geoInstallCost + calcInflatedCost(geoAnnual, 10)
  const geo30YearWithInflation = data.geoInstallCost + calcInflatedCost(geoAnnual, 30)
  
  const trad10YearWithInflation = data.tradInstallCost + calcInflatedCost(tradAnnualTotal, 10)
  const trad30YearWithInflation = data.tradInstallCost + calcInflatedCost(tradAnnualTotal, 30) + (data.tradReplacementCost || 0)
  
  const milestones = [
    { 
      label: 'At Install', 
      sublabel: 'After Rebates & Tax Credits',
      geo: data.geoInstallCost,
      trad: data.tradInstallCost,
      icon: CheckCircle2,
      color: 'blue'
    },
    { 
      label: 'After 10 Years', 
      sublabel: 'Install + Operating (5% inflation)',
      geo: geo10YearWithInflation,
      trad: trad10YearWithInflation,
      icon: Clock,
      color: 'amber'
    },
    { 
      label: 'After 30 Years', 
      sublabel: 'Including replacement + inflation',
      geo: geo30YearWithInflation,
      trad: trad30YearWithInflation,
      icon: TrendingUp,
      color: 'green'
    }
  ]

  const maxCost = Math.max(...milestones.flatMap(m => [m.geo, m.trad]))
  
  // SVG dimensions for horizontal bars
  const svgWidth = 400
  const barHeight = 28
  const barGap = 6
  const labelWidth = 90
  const valueWidth = 60
  const chartWidth = svgWidth - labelWidth - valueWidth - 20

  return (
    <div className="space-y-6">
      {/* System Cost Breakdown Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-6 text-white">
        <h4 className="text-xl font-bold mb-4 text-center">GEO (Heating + Cooling) + SOLAR</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-2xl font-bold">${(data.drillingCost/1000).toFixed(0)}K</div>
            <div className="text-xs opacity-90">Drilling</div>
            <div className="text-[10px] opacity-75">2×400ft bores</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-2xl font-bold">${(data.hvacCost/1000).toFixed(0)}K</div>
            <div className="text-xs opacity-90">VRF 5-Ton GSHP</div>
            <div className="text-[10px] opacity-75">+ multi-zone</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-2xl font-bold">${(data.solarCost/1000).toFixed(0)}K</div>
            <div className="text-xs opacity-90">Solar System</div>
            <div className="text-[10px] opacity-75">15kW</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 border-2 border-white/50">
            <div className="text-2xl font-bold">FREE</div>
            <div className="text-xs opacity-90">Battery 48kWh</div>
            <div className="text-[10px] opacity-75">(${(data.batteryCost/1000).toFixed(0)}K value)</div>
          </div>
        </div>
        
        {/* Incentives Breakdown */}
        <div className="mt-4 bg-white/10 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-sm">
            <div>
              <div className="opacity-75">Gross Total</div>
              <div className="font-bold">${(data.geoGrossTotal/1000).toFixed(0)}K</div>
            </div>
            <div>
              <div className="opacity-75">MassSave Rebate</div>
              <div className="font-bold text-green-300">-${(data.massSaveRebate/1000).toFixed(1)}K</div>
            </div>
            <div>
              <div className="opacity-75">Federal IRA (30%)</div>
              <div className="font-bold text-green-300">-${(data.geoFederalCredit/1000).toFixed(1)}K</div>
            </div>
            <div className="bg-white/20 rounded-lg py-1">
              <div className="opacity-75">Your Cost</div>
              <div className="font-bold text-xl">${(data.geoInstallCost/1000).toFixed(0)}K</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Milestone Comparison - Horizontal Bar Style */}
      <div className="space-y-6">
        {milestones.map((milestone, idx) => {
          const savings = milestone.trad - milestone.geo
          const savingsPercent = Math.round((savings / milestone.trad) * 100)
          const IconComponent = milestone.icon
          const geoWidth = Math.max((milestone.geo / maxCost) * chartWidth, 40)
          const tradWidth = Math.max((milestone.trad / maxCost) * chartWidth, 40)
          
          return (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Header */}
              <div className={`flex items-center justify-between p-4 ${
                milestone.color === 'blue' ? 'bg-blue-50 border-b border-blue-200' :
                milestone.color === 'amber' ? 'bg-amber-50 border-b border-amber-200' :
                'bg-green-50 border-b border-green-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    milestone.color === 'blue' ? 'bg-blue-500' :
                    milestone.color === 'amber' ? 'bg-amber-500' :
                    'bg-green-500'
                  }`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{milestone.label}</div>
                    <div className="text-xs text-gray-500">{milestone.sublabel}</div>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-lg text-sm font-bold ${
                  milestone.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                  milestone.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  Save ${Math.round(savings / 1000)}K ({savingsPercent}%)
                </div>
              </div>
              
              {/* Horizontal Bar Chart */}
              <div className="p-4">
                <svg viewBox={`0 0 ${svgWidth} ${(barHeight + barGap) * 2 + 5}`} className="w-full">
                  <defs>
                    <linearGradient id={`geoGradM${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#4ade80" />
                    </linearGradient>
                    <linearGradient id={`tradGradM${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#f87171" />
                    </linearGradient>
                  </defs>
                  
                  {/* GEO+Solar Bar */}
                  <g>
                    <text x={labelWidth - 8} y={barHeight / 2 + 5} textAnchor="end" className="text-xs font-medium" fill="#374151">
                      GEO+Solar
                    </text>
                    <rect x={labelWidth} y={0} width={chartWidth} height={barHeight} rx="6" fill="#e5e7eb" />
                    <rect x={labelWidth} y={0} width={geoWidth} height={barHeight} rx="6" fill={`url(#geoGradM${idx})`} 
                          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                    <text x={labelWidth + geoWidth + 8} y={barHeight / 2 + 5} textAnchor="start" className="text-sm font-bold" fill="#15803d">
                      ${Math.round(milestone.geo / 1000)}K
                    </text>
                  </g>
                  
                  {/* Traditional Bar */}
                  <g transform={`translate(0, ${barHeight + barGap})`}>
                    <text x={labelWidth - 8} y={barHeight / 2 + 5} textAnchor="end" className="text-xs font-medium" fill="#374151">
                      Traditional
                    </text>
                    <rect x={labelWidth} y={0} width={chartWidth} height={barHeight} rx="6" fill="#e5e7eb" />
                    <rect x={labelWidth} y={0} width={tradWidth} height={barHeight} rx="6" fill={`url(#tradGradM${idx})`}
                          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                    <text x={labelWidth + tradWidth + 8} y={barHeight / 2 + 5} textAnchor="start" className="text-sm font-bold" fill="#dc2626">
                      ${Math.round(milestone.trad / 1000)}K
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          )
        })}
      </div>

      {/* Cost Comparison Table */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h5 className="font-bold text-gray-800 mb-4 text-center">Annual Operating Costs Comparison</h5>
        <div className="grid md:grid-cols-2 gap-6">
          {/* GeoPioneer Annual */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="font-semibold text-green-800 mb-3 text-center">GeoPioneer (with Solar)</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Annual Operating:</span>
                <span className="font-bold text-green-700">~${data.geoAnnualOperating?.toLocaleString() || 500}/yr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fuel Cost:</span>
                <span className="font-bold text-green-700">$0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Maintenance:</span>
                <span className="font-bold text-green-700">~$200/yr</span>
              </div>
            </div>
          </div>
          
          {/* Traditional Annual */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="font-semibold text-red-800 mb-3 text-center">Traditional HVAC</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Annual Fuel:</span>
                <span className="font-bold text-red-700">${data.tradAnnualFuel?.toLocaleString()}/yr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Annual Electric:</span>
                <span className="font-bold text-red-700">${data.tradAnnualElectric?.toLocaleString()}/yr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Equipment @15yr:</span>
                <span className="font-bold text-red-700">${(data.tradReplacementCost/1000).toFixed(0)}K</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-gray-500">
          * Traditional costs include 5% annual fuel inflation. GeoPioneer: solar offsets most electricity.
        </div>
      </div>

      {/* Battery Benefit Note */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
        <div className="flex items-start gap-3">
          <Battery className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <div className="font-semibold text-purple-800">FREE Battery Backup Included</div>
            <div className="text-sm text-purple-700">
              GeoPioneer provides a 48kWh battery system (${(data.batteryCost/1000).toFixed(0)}K value) at no cost to you. 
              You get reliable home backup power during outages. GeoPioneer manages the battery as part of our 
              distributed energy network for grid stability.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const CalculatorPage = () => {
  const [activeTab, setActiveTab] = useState('existing')
  const [calculatorData, setCalculatorData] = useState({
    // Common fields
    squareFootage: '',
    zipCode: '',
    
    // Current system
    heatingFuel: '',
    coolingSystem: '',
    annualHeatingCost: '',
    annualElectricityCost: '',
    
    // New construction specific
    homeType: '',
    constructionTier: '',
    
    // Contact (optional)
    name: '',
    email: '',
    phone: ''
  })
  
  const [results, setResults] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [assessmentData, setAssessmentData] = useState({
    assessmentType: 'full', // 'full' or 'consultation'
    propertyAddress: '',
    timeframe: '',
    additionalInfo: ''
  })

  // Massachusetts energy prices
  const energyPrices = {
    electricity: 0.35, // $/kWh
    naturalGas: 1.50,  // $/therm
    heatingOil: 3.44,  // $/gallon
    propane: 3.50      // $/gallon
  }

  // Geothermal COP values
  const geothermalCOP = {
    heating: 4.2, // Winter COP
    cooling: 6.5  // Summer COP
  }

  const calculateSavings = () => {
    const sqft = parseInt(calculatorData.squareFootage) || 0
    const heatingCost = parseFloat(calculatorData.annualHeatingCost) || 0
    const electricityCost = parseFloat(calculatorData.annualElectricityCost) || 0
    
    // Validation
    if (sqft === 0) {
      alert('Please enter your home square footage')
      return
    }
    
    if (!calculatorData.heatingFuel) {
      alert('Please select your current heating fuel type')
      return
    }
    
    if (heatingCost === 0) {
      alert('Please enter your annual heating cost')
      return
    }
    
    console.log('Calculating savings with:', { sqft, heatingCost, electricityCost, heatingFuel: calculatorData.heatingFuel })

    // Calculate current total energy costs
    const currentAnnualCost = heatingCost + electricityCost

    // Estimate geothermal energy consumption
    // Typical home uses ~12-15 kWh per sq ft annually for HVAC
    const estimatedAnnualKWh = sqft * 13 // Conservative estimate
    
    // Geothermal efficiency factor (compared to conventional systems)
    let efficiencyFactor = 1
    switch (calculatorData.heatingFuel) {
      case 'oil':
        efficiencyFactor = 0.35 // 65% more efficient
        break
      case 'propane':
        efficiencyFactor = 0.30 // 70% more efficient
        break
      case 'electric':
        efficiencyFactor = 0.40 // 60% more efficient
        break
      case 'naturalGas':
        efficiencyFactor = 0.45 // 55% more efficient
        break
      default:
        efficiencyFactor = 0.35
    }

    const geothermalAnnualKWh = estimatedAnnualKWh * efficiencyFactor
    const geothermalAnnualCost = geothermalAnnualKWh * energyPrices.electricity

    // Calculate savings
    const annualSavings = currentAnnualCost - geothermalAnnualCost
    const monthlySavings = annualSavings / 12
    const tenYearSavings = annualSavings * 10
    const twentyFiveYearSavings = annualSavings * 25

    // Energy reduction percentage
    const energyReduction = Math.round((1 - efficiencyFactor) * 100)

    // OPTION 1: Geothermal Only System costs (scaled from 2200 sqft base)
    const geoOnlyBaseSqft = 2200
    const geoOnlyScale = sqft / geoOnlyBaseSqft
    
    const geoOnlyDrilling = Math.round(30000 * geoOnlyScale)  // 2x400ft bores
    const geoOnlyHVAC = Math.round(30000 * geoOnlyScale)      // VRF 5-ton GSHP + multi-zone
    const geoOnlyGross = geoOnlyDrilling + geoOnlyHVAC        // $60K for 2200sqft
    
    const geoOnlyMassSave = 13500  // MassSave rebate
    const geoOnlyFederalBase = geoOnlyGross - geoOnlyMassSave
    const geoOnlyFederalCredit = geoOnlyFederalBase * 0.30    // 30% IRA
    const geoOnlyNetCost = geoOnlyGross - geoOnlyMassSave - geoOnlyFederalCredit

    // For backwards compatibility
    const systemCostBase = geoOnlyGross
    const massSaveRebateOld = geoOnlyMassSave
    const federalTaxCredit = geoOnlyFederalCredit
    const netSystemCost = geoOnlyNetCost

    // Payback period
    const paybackYears = netSystemCost / annualSavings

    // CAPEX Comparison Data (Option 1: Geo Only)
    const capexComparison = {
      'Geothermal': Math.round(geoOnlyNetCost),
      'Propane + AC': Math.round(12000 * geoOnlyScale),
      'ASHP': Math.round(18000 * geoOnlyScale),
      'Natural Gas + AC': Math.round(10000 * geoOnlyScale)
    }

    // ROI Chart Data
    const roiData = {
      netCost: geoOnlyNetCost,
      cumulativeSavings: annualSavings,
      geoOnlyDrilling,
      geoOnlyHVAC,
      geoOnlyGross,
      geoOnlyMassSave,
      geoOnlyFederalCredit
    }

    // Lifetime Cost Comparison Data (GSHP 30 years vs others 15 years)
    const tradUpfrontCost = Math.round(12000 * geoOnlyScale) // Traditional HVAC scaled
    const lifetimeCostData = {
      geothermal: {
        name: 'Geothermal GSHP',
        lifespan: 30,
        upfrontCost: geoOnlyNetCost,
        annualCost: geothermalAnnualCost,
        replacementCost: 0, // No replacement needed in 30 years
        totalLifetimeCost: geoOnlyNetCost + (geothermalAnnualCost * 30)
      },
      conventional: {
        name: calculatorData.heatingFuel === 'oil' ? 'Oil Furnace + AC' : 
              calculatorData.heatingFuel === 'propane' ? 'Propane Furnace + AC' :
              calculatorData.heatingFuel === 'naturalGas' ? 'Gas Furnace + AC' : 'Electric Heat + AC',
        lifespan: 15,
        upfrontCost: tradUpfrontCost,
        annualCost: currentAnnualCost,
        replacementCost: Math.round(tradUpfrontCost * 1.3), // Replacement at 15 years with inflation
        totalLifetimeCost: tradUpfrontCost + (currentAnnualCost * 15) + Math.round(tradUpfrontCost * 1.3) + (currentAnnualCost * 15) // 30 years total
      }
    }

    // For new construction, compare with alternatives
    let newConstructionComparison = null
    if (activeTab === 'new-construction') {
      const propaneSystemCost = 48000
      const ashpSystemCost = 60000
      const geothermalSystemCost = Math.round(netSystemCost)
      
      newConstructionComparison = {
        propane: {
          upfrontCost: propaneSystemCost,
          annualCost: 9600,
          tenYearTotal: propaneSystemCost + (9600 * 10)
        },
        ashp: {
          upfrontCost: ashpSystemCost,
          annualCost: 8600,
          tenYearTotal: ashpSystemCost + (8600 * 10)
        },
        geothermal: {
          upfrontCost: geothermalSystemCost,
          annualCost: geothermalAnnualCost,
          tenYearTotal: geothermalSystemCost + (geothermalAnnualCost * 10)
        }
      }
    }

    // 3-Milestone Comparison Data (GeoPioneer complete system vs Traditional)
    // Base costs for 2200 sqft house - scale for other sizes
    const baseSqft = 2200
    const scaleFactor = sqft / baseSqft
    
    // System component costs (base for 2200 sqft)
    const drillingCost = Math.round(30000 * scaleFactor)  // 2x400ft bores for 5-ton system
    const hvacCost = Math.round(30000 * scaleFactor)      // VRF 5-ton water-to-air GSHP + install + multi-zone control
    const solarCost = Math.round(45000 * scaleFactor)     // 15kW solar system
    const batteryCost = Math.round(25000 * scaleFactor)   // 3x16kWh = 48kWh battery (FREE to customer)
    
    // Total system cost (battery included in gross but FREE to customer)
    const geoGrossTotal = drillingCost + hvacCost + solarCost + batteryCost
    
    // Incentives calculation
    const massSaveRebate = 13500  // MassSave rebate (fixed - Tier 1/2 renovation)
    const federalCreditBase = geoGrossTotal - massSaveRebate  // IRA applies to cost after MassSave
    const geoFederalCredit = federalCreditBase * 0.30  // 30% federal IRA tax credit
    const geoNetInstall = geoGrossTotal - massSaveRebate - geoFederalCredit
    
    // Traditional system costs (scaled)
    const tradHVACCost = Math.round(12000 * scaleFactor) // Base $12K for 2200sqft
    const tradAnnualFuel = calculatorData.heatingFuel === 'oil' ? Math.round(2700 * scaleFactor) : 
                          calculatorData.heatingFuel === 'propane' ? Math.round(3200 * scaleFactor) :
                          calculatorData.heatingFuel === 'naturalGas' ? Math.round(2200 * scaleFactor) : 
                          Math.round(2000 * scaleFactor)
    const tradAnnualElectric = Math.round(2400 * scaleFactor)
    const tradReplacementCost = Math.round(tradHVACCost * 1.3) // Replacement at 15 years (with inflation)
    
    // GeoPioneer annual operating cost (near $0 with solar, just minimal grid + maintenance)
    const geoAnnualOperating = Math.round(500 * scaleFactor) // ~$500/yr for 2200sqft
    
    // Calculate 10-year costs (with 5% fuel inflation for traditional)
    const tradFuel10Year = Array.from({length: 10}, (_, i) => tradAnnualFuel * Math.pow(1.05, i)).reduce((a,b) => a+b, 0)
    const tradElectric10Year = tradAnnualElectric * 10
    const geo10YearOperating = geoAnnualOperating * 10
    
    // Calculate 30-year costs (with replacement and continued inflation)
    const tradFuel30Year = Array.from({length: 30}, (_, i) => tradAnnualFuel * Math.pow(1.05, i)).reduce((a,b) => a+b, 0)
    const tradElectric30Year = tradAnnualElectric * 30
    const geo30YearOperating = geoAnnualOperating * 30
    
    const threeMilestoneData = {
      // GeoPioneer system component costs
      drillingCost,
      hvacCost,
      solarCost,
      batteryCost,
      scaleFactor,
      baseSqft,
      
      // Incentives
      geoGrossTotal,
      massSaveRebate,
      geoFederalCredit,
      
      // Install costs (after rebates)
      geoInstallCost: Math.round(geoNetInstall),
      tradInstallCost: tradHVACCost,
      
      // 10-year total costs
      geo10YearCost: Math.round(geoNetInstall + geo10YearOperating),
      trad10YearCost: Math.round(tradHVACCost + tradFuel10Year + tradElectric10Year),
      
      // 30-year total costs (including replacement)
      geo30YearCost: Math.round(geoNetInstall + geo30YearOperating),
      trad30YearCost: Math.round(tradHVACCost + tradFuel30Year + tradElectric30Year + tradReplacementCost),
      
      // Annual operating costs
      geoAnnualOperating,
      tradAnnualFuel,
      tradAnnualElectric,
      
      // Traditional breakdown
      tradHVACCost,
      tradReplacementCost
    }

    setResults({
      currentAnnualCost,
      geothermalAnnualCost,
      annualSavings,
      monthlySavings,
      tenYearSavings,
      twentyFiveYearSavings,
      energyReduction,
      systemCostBase,
      massSaveRebate,
      federalTaxCredit,
      netSystemCost,
      paybackYears,
      newConstructionComparison,
      capexComparison,
      roiData,
      lifetimeCostData,
      threeMilestoneData
    })
    setShowResults(true)
  }

  const handleInputChange = (field, value) => {
    setCalculatorData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAssessmentChange = (field, value) => {
    setAssessmentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAssessmentSubmit = () => {
    // Validate required fields
    if (!calculatorData.name || !calculatorData.email || !calculatorData.phone) {
      alert('Please fill in all required contact information (Name, Email, Phone)')
      return
    }

    // Prepare assessment data
    const assessmentRequest = {
      contactInfo: {
        name: calculatorData.name,
        email: calculatorData.email,
        phone: calculatorData.phone
      },
      projectType: activeTab,
      assessmentType: assessmentData.assessmentType,
      propertyDetails: {
        address: assessmentData.propertyAddress,
        squareFootage: calculatorData.squareFootage,
        zipCode: calculatorData.zipCode
      },
      currentSystem: {
        heatingFuel: calculatorData.heatingFuel,
        coolingSystem: calculatorData.coolingSystem,
        annualHeatingCost: calculatorData.annualHeatingCost,
        annualElectricityCost: calculatorData.annualElectricityCost
      },
      projectInfo: {
        timeframe: assessmentData.timeframe,
        additionalInfo: assessmentData.additionalInfo
      },
      calculatorResults: results
    }

    // In a real application, this would send to your backend
    console.log('Assessment Request:', assessmentRequest)
    
    // Show success message
    alert(`Thank you ${calculatorData.name}! Your free assessment request has been submitted. We'll contact you within 24 hours to schedule your ${assessmentData.assessmentType === 'full' ? 'comprehensive site assessment' : 'consultation call'}.`)
  }

  const handleDownloadReport = () => {
    if (!results) {
      alert('Please calculate your savings first to generate a report.')
      return
    }

    // In a real application, this would generate and download a PDF report
    const reportData = {
      projectType: activeTab,
      calculatorData,
      results,
      timestamp: new Date().toISOString()
    }
    
    console.log('Report Data:', reportData)
    alert('Report download functionality will be implemented. Your calculation results have been logged.')
  }

  const renderExistingHomesCalculator = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="squareFootage">Home Square Footage *</Label>
          <Input
            id="squareFootage"
            type="number"
            placeholder="e.g., 2500"
            value={calculatorData.squareFootage}
            onChange={(e) => handleInputChange('squareFootage', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            placeholder="e.g., 02101"
            value={calculatorData.zipCode}
            onChange={(e) => handleInputChange('zipCode', e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="heatingFuel">Current Heating Fuel *</Label>
          <Select value={calculatorData.heatingFuel} onValueChange={(value) => handleInputChange('heatingFuel', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select heating fuel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oil">Heating Oil</SelectItem>
              <SelectItem value="propane">Propane</SelectItem>
              <SelectItem value="naturalGas">Natural Gas</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="coolingSystem">Current Cooling System</Label>
          <Select value={calculatorData.coolingSystem} onValueChange={(value) => handleInputChange('coolingSystem', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select cooling system" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="central-ac">Central Air Conditioning</SelectItem>
              <SelectItem value="window-units">Window Units</SelectItem>
              <SelectItem value="none">No Cooling System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="annualHeatingCost">Annual Heating Cost *</Label>
          <Input
            id="annualHeatingCost"
            type="number"
            placeholder="e.g., 3500"
            value={calculatorData.annualHeatingCost}
            onChange={(e) => handleInputChange('annualHeatingCost', e.target.value)}
          />
          <p className="text-sm text-gray-500 mt-1">Your total yearly heating bill</p>
        </div>
        <div>
          <Label htmlFor="annualElectricityCost">Annual Electricity Cost</Label>
          <Input
            id="annualElectricityCost"
            type="number"
            placeholder="e.g., 2400"
            value={calculatorData.annualElectricityCost}
            onChange={(e) => handleInputChange('annualElectricityCost', e.target.value)}
          />
          <p className="text-sm text-gray-500 mt-1">Your total yearly electricity bill</p>
        </div>
      </div>
    </div>
  )

  const renderNewConstructionCalculator = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="squareFootage">Home Square Footage *</Label>
          <Input
            id="squareFootage"
            type="number"
            placeholder="e.g., 4000"
            value={calculatorData.squareFootage}
            onChange={(e) => handleInputChange('squareFootage', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="homeType">Home Type</Label>
          <Select value={calculatorData.homeType} onValueChange={(value) => handleInputChange('homeType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select home type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single-family">Single Family</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="custom">Custom Home</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="constructionTier">Construction Efficiency Tier</Label>
          <Select value={calculatorData.constructionTier} onValueChange={(value) => handleInputChange('constructionTier', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select efficiency tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tier1">Tier 1 (Standard)</SelectItem>
              <SelectItem value="tier2">Tier 2 (High Efficiency)</SelectItem>
              <SelectItem value="tier3">Tier 3 (Premium)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            placeholder="e.g., 02101"
            value={calculatorData.zipCode}
            onChange={(e) => handleInputChange('zipCode', e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="heatingFuel">Compare Against</Label>
          <Select value={calculatorData.heatingFuel} onValueChange={(value) => handleInputChange('heatingFuel', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select system to compare" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="propane">Propane + AC</SelectItem>
              <SelectItem value="naturalGas">Natural Gas + AC</SelectItem>
              <SelectItem value="electric">Air Source Heat Pump</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">New Construction Benefits</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Maximize federal and state incentives</li>
          <li>• No retrofit complications or existing system removal</li>
          <li>• Optimal system sizing and integration</li>
          <li>• Potential for GaaS (Geo as a Service) model</li>
        </ul>
      </div>
    </div>
  )

  const renderResults = () => {
    if (!results) return null

    return (
      <div className="space-y-8">
        {/* Energy Savings Highlight */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-800">Energy Savings</CardTitle>
            <div className="text-4xl font-bold text-green-600">{results.energyReduction}%</div>
            <CardDescription className="text-green-700">
              Energy reduction compared to your current system
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Cost Savings */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Monthly Savings</CardTitle>
              <div className="text-2xl font-bold text-blue-600">
                ${Math.round(results.monthlySavings).toLocaleString()}
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Annual Savings</CardTitle>
              <div className="text-2xl font-bold text-blue-600">
                ${Math.round(results.annualSavings).toLocaleString()}
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">25-Year Savings</CardTitle>
              <div className="text-2xl font-bold text-blue-600">
                ${Math.round(results.twentyFiveYearSavings).toLocaleString()}
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* System Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>System Cost & Incentives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Base System Cost:</span>
                <span className="font-semibold">${results.systemCostBase.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>MassSave Rebate:</span>
                <span className="font-semibold">-${results.massSaveRebate.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Federal Tax Credit (30%):</span>
                <span className="font-semibold">-${Math.round(results.federalTaxCredit).toLocaleString()}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Net System Cost:</span>
                <span>${Math.round(results.netSystemCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Payback Period:</span>
                <span>{results.paybackYears.toFixed(1)} years</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Construction Comparison */}
        {activeTab === 'new-construction' && results.newConstructionComparison && (
          <Card>
            <CardHeader>
              <CardTitle>10-Year Total Cost Comparison</CardTitle>
              <CardDescription>Upfront cost + 10 years of operating costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800">Geothermal</h4>
                    <div className="text-2xl font-bold text-green-600">
                      ${Math.round(results.newConstructionComparison.geothermal.tenYearTotal).toLocaleString()}
                    </div>
                    <Badge className="bg-green-600 text-white mt-2">Best Value</Badge>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800">Propane + AC</h4>
                    <div className="text-2xl font-bold text-gray-600">
                      ${Math.round(results.newConstructionComparison.propane.tenYearTotal).toLocaleString()}
                    </div>
                    <div className="text-sm text-red-600 mt-2">
                      +${Math.round(results.newConstructionComparison.propane.tenYearTotal - results.newConstructionComparison.geothermal.tenYearTotal).toLocaleString()} more
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800">Air Source HP</h4>
                    <div className="text-2xl font-bold text-gray-600">
                      ${Math.round(results.newConstructionComparison.ashp.tenYearTotal).toLocaleString()}
                    </div>
                    <div className="text-sm text-red-600 mt-2">
                      +${Math.round(results.newConstructionComparison.ashp.tenYearTotal - results.newConstructionComparison.geothermal.tenYearTotal).toLocaleString()} more
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Section */}
        <div className="space-y-6">
          {/* ROI Chart - Full Width */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Return on Investment Timeline
              </CardTitle>
              <CardDescription>
                See your savings grow over time (30-year projection)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ROIChart data={results.roiData} />
            </CardContent>
          </Card>

          {/* OPTION 1: Geothermal Only */}
          <div className="mt-8">
            <div className="text-center mb-6">
              <Badge className="bg-blue-600 text-white px-4 py-2 text-lg mb-2">OPTION 1</Badge>
              <h3 className="text-2xl font-bold text-gray-900">Geothermal HVAC Only</h3>
              <p className="text-gray-600">Replace your heating/cooling with geothermal heat pump</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Investment Comparison
                  </CardTitle>
                  <CardDescription>
                    Compare upfront costs across heating systems
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CapexComparisonChart data={results.capexComparison} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-purple-600" />
                    30-Year Lifetime Cost
                  </CardTitle>
                  <CardDescription>
                    Total cost including replacements (GSHP 30yr vs Conventional 15yr lifespan)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LifetimeCostChart data={results.lifetimeCostData} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* OPTION 2: Geothermal + Solar + Battery */}
          <div className="mt-12">
            <div className="text-center mb-6">
              <Badge className="bg-green-600 text-white px-4 py-2 text-lg mb-2">OPTION 2 - RECOMMENDED</Badge>
              <h3 className="text-2xl font-bold text-gray-900">GEO (Heating + Cooling) + SOLAR + FREE Battery</h3>
              <p className="text-gray-600">Maximum savings with full energy independence (5% annual inflation on traditional costs)</p>
            </div>
            
            <Card className="border-2 border-green-300">
              <CardContent className="pt-6">
                <ThreeMilestoneComparison data={results.threeMilestoneData} />
              </CardContent>
            </Card>
          </div>

          {/* OPTION 3: Energy as a Service (EaaS) */}
          <div className="mt-12">
            <div className="text-center mb-6">
              <Badge className="bg-purple-600 text-white px-4 py-2 text-lg mb-2">OPTION 3</Badge>
              <h3 className="text-2xl font-bold text-gray-900">Energy as a Service (EaaS)</h3>
              <p className="text-gray-600">$0 upfront — 10% discount on your current utility bills</p>
            </div>
            
            <Card className="border-2 border-purple-300 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Shield className="h-10 w-10" />
                  <div>
                    <h4 className="text-2xl font-bold">Zero Upfront Cost</h4>
                    <p className="text-purple-200">GeoPioneer owns and maintains the system</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center mt-6">
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-3xl font-bold">$0</div>
                    <div className="text-sm opacity-90">Installation</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-3xl font-bold">$0</div>
                    <div className="text-sm opacity-90">Maintenance</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-3xl font-bold">$0</div>
                    <div className="text-sm opacity-90">Repairs</div>
                  </div>
                </div>
              </div>
              
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* How EaaS Works */}
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <h5 className="font-bold text-purple-800 mb-4 flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      How Energy as a Service Works
                    </h5>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-purple-600 font-bold">1</span>
                        </div>
                        <div className="text-sm font-medium text-gray-800">We Install</div>
                        <div className="text-xs text-gray-600">Full system at no cost to you</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-purple-600 font-bold">2</span>
                        </div>
                        <div className="text-sm font-medium text-gray-800">You Pay Monthly</div>
                        <div className="text-xs text-gray-600">Fixed rate for heating & cooling</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-purple-600 font-bold">3</span>
                        </div>
                        <div className="text-sm font-medium text-gray-800">We Maintain</div>
                        <div className="text-xs text-gray-600">All service & repairs included</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-purple-600 font-bold">4</span>
                        </div>
                        <div className="text-sm font-medium text-gray-800">Option to Buy</div>
                        <div className="text-xs text-gray-600">Purchase system anytime</div>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Cost Comparison */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                      <h6 className="font-semibold text-red-800 mb-3">Traditional Monthly Costs</h6>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Heating (Fuel)</span>
                          <span className="font-medium text-red-700">${Math.round((results?.threeMilestoneData?.tradAnnualFuel || 2700) / 12)}/mo</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Cooling (Electric)</span>
                          <span className="font-medium text-red-700">${Math.round((results?.threeMilestoneData?.tradAnnualElectric || 2400) / 12)}/mo</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Maintenance</span>
                          <span className="font-medium text-red-700">~$17/mo</span>
                        </div>
                        <hr className="border-red-200" />
                        <div className="flex justify-between">
                          <span className="font-semibold text-red-800">Current Total</span>
                          <span className="font-bold text-red-700 text-lg">
                            ${Math.round(((results?.threeMilestoneData?.tradAnnualFuel || 2700) + (results?.threeMilestoneData?.tradAnnualElectric || 2400) + 200) / 12)}/mo
                          </span>
                        </div>
                        <div className="text-xs text-red-600 mt-2">+ 5% annual price increases</div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-xl p-5 border-2 border-purple-400">
                      <h6 className="font-semibold text-purple-800 mb-3">EaaS Monthly Rate</h6>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Heating & Cooling</span>
                          <span className="font-medium text-purple-700">Included</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Maintenance</span>
                          <span className="font-medium text-purple-700">Included</span>
                        </div>
                        <hr className="border-purple-200" />
                        <div className="flex justify-between">
                          <span className="font-semibold text-purple-800">Fixed Monthly</span>
                          <span className="font-bold text-purple-700 text-lg">
                            ${Math.round(((results?.threeMilestoneData?.tradAnnualFuel || 2700) + (results?.threeMilestoneData?.tradAnnualElectric || 2400) + 200) * 0.9 / 12)}/mo*
                          </span>
                        </div>
                        <div className="text-xs text-purple-600 mt-2">*10% savings vs current bills, locked rate</div>
                      </div>
                    </div>
                  </div>

                  {/* EaaS Benefits */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-800">No Capital Risk</div>
                        <div className="text-xs text-gray-600">Keep your money for other investments</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-800">Predictable Costs</div>
                        <div className="text-xs text-gray-600">No surprise heating bills</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-800">Worry-Free</div>
                        <div className="text-xs text-gray-600">We handle everything</div>
                      </div>
                    </div>
                  </div>

                  {/* Comparison Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Feature</th>
                          <th className="text-center py-3 px-2 font-semibold text-blue-700">Option 1<br/><span className="font-normal text-xs">Geo Only</span></th>
                          <th className="text-center py-3 px-2 font-semibold text-green-700">Option 2<br/><span className="font-normal text-xs">Complete System</span></th>
                          <th className="text-center py-3 px-2 font-semibold text-purple-700 bg-purple-50">Option 3<br/><span className="font-normal text-xs">EaaS</span></th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-2 text-gray-600">Upfront Cost</td>
                          <td className="text-center py-3 px-2">${Math.round((results?.netSystemCost || 32000) / 1000)}K</td>
                          <td className="text-center py-3 px-2">${Math.round((results?.threeMilestoneData?.geoInstallCost || 50000) / 1000)}K</td>
                          <td className="text-center py-3 px-2 bg-purple-50 font-bold text-purple-700">$0</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-2 text-gray-600">Monthly Payment</td>
                          <td className="text-center py-3 px-2">$0</td>
                          <td className="text-center py-3 px-2">$0</td>
                          <td className="text-center py-3 px-2 bg-purple-50">~${Math.round(((results?.threeMilestoneData?.tradAnnualFuel || 2700) + (results?.threeMilestoneData?.tradAnnualElectric || 2400) + 200) * 0.9 / 12)}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-2 text-gray-600">Maintenance</td>
                          <td className="text-center py-3 px-2">Your responsibility</td>
                          <td className="text-center py-3 px-2">Your responsibility</td>
                          <td className="text-center py-3 px-2 bg-purple-50 font-medium text-purple-700">Included</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-2 text-gray-600">Solar + Battery</td>
                          <td className="text-center py-3 px-2">❌</td>
                          <td className="text-center py-3 px-2">✅</td>
                          <td className="text-center py-3 px-2 bg-purple-50">✅</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-2 text-gray-600">Own Equipment</td>
                          <td className="text-center py-3 px-2">✅</td>
                          <td className="text-center py-3 px-2">✅</td>
                          <td className="text-center py-3 px-2 bg-purple-50">After buyout</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-2 text-gray-600">Best For</td>
                          <td className="text-center py-3 px-2 text-xs">Budget-conscious</td>
                          <td className="text-center py-3 px-2 text-xs">Max long-term savings</td>
                          <td className="text-center py-3 px-2 bg-purple-50 text-xs font-medium text-purple-700">Zero risk entry</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Perfect for homeowners who want geothermal benefits without the upfront investment
                    </p>
                    <Button 
                      variant="outline" 
                      className="border-purple-400 text-purple-700 hover:bg-purple-50"
                      onClick={() => {
                        const contactSection = document.querySelector('[data-section="contact"]')
                        if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      Learn More About EaaS
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Calculator className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Geothermal Savings Calculator
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover how much you can save with geothermal heating and cooling. 
            Get personalized calculations for your home or new construction project.
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="existing" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Existing Homes
              </TabsTrigger>
              <TabsTrigger value="new-construction" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                New Construction
              </TabsTrigger>
            </TabsList>

            <TabsContent value="existing">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-blue-600" />
                    Existing Home Renovation Calculator
                  </CardTitle>
                  <CardDescription>
                    Calculate savings from retrofitting your existing home with geothermal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderExistingHomesCalculator()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="new-construction">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-green-600" />
                    New Construction Calculator
                  </CardTitle>
                  <CardDescription>
                    Compare geothermal costs and savings for new construction projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderNewConstructionCalculator()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>



          {/* Results */}
          {showResults && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Your Geothermal Savings Report
              </h2>
              {renderResults()}
              
              {/* Simple Assessment Form */}
              <Card className="mt-8 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-green-800">Get Your Detailed Assessment Report</CardTitle>
                  <CardDescription className="text-green-700">
                    Download a comprehensive PDF report with your calculations and next steps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label htmlFor="reportName">Full Name *</Label>
                      <Input
                        id="reportName"
                        placeholder="Your full name"
                        value={assessmentData.name}
                        onChange={(e) => handleAssessmentChange('name', e.target.value)}
                        className="border-green-200 focus:border-green-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reportEmail">Email Address *</Label>
                      <Input
                        id="reportEmail"
                        type="email"
                        placeholder="your.email@example.com"
                        value={assessmentData.email}
                        onChange={(e) => handleAssessmentChange('email', e.target.value)}
                        className="border-green-200 focus:border-green-400"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label htmlFor="reportPhone">Phone Number *</Label>
                      <Input
                        id="reportPhone"
                        placeholder="(555) 123-4567"
                        value={assessmentData.phone}
                        onChange={(e) => handleAssessmentChange('phone', e.target.value)}
                        className="border-green-200 focus:border-green-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reportAddress">Property Address</Label>
                      <Input
                        id="reportAddress"
                        placeholder="123 Main St, City, State"
                        value={assessmentData.address}
                        onChange={(e) => handleAssessmentChange('address', e.target.value)}
                        className="border-green-200 focus:border-green-400"
                      />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      size="lg"
                      onClick={async () => {
                        // Validate required fields
                        if (!assessmentData.name || !assessmentData.email || !assessmentData.phone) {
                          alert('Please fill in your name, email, and phone number to generate the report.')
                          return
                        }
                        
                        // Prepare form data
                        const formData = {
                          name: assessmentData.name,
                          email: assessmentData.email,
                          phone: assessmentData.phone,
                          address: assessmentData.address,
                          squareFootage: calculatorData.squareFootage,
                          heatingFuel: calculatorData.heatingFuel,
                          annualHeatingCost: calculatorData.annualHeatingCost,
                          annualElectricityCost: calculatorData.annualElectricityCost,
                          zipCode: calculatorData.zipCode,
                          calculationResults: results,
                          submissionDate: new Date().toLocaleDateString(),
                          submissionTime: new Date().toLocaleTimeString(),
                          assessmentType: 'Calculator Assessment'
                        }
                        
                        // Generate and download PDF report
                        try {
                          const { generateAndSendReport } = await import('../../services/reportService.js')
                          const result = await generateAndSendReport(formData, 'calculator')
                          
                          if (result.success) {
                            alert(`Thank you ${formData.name}! 

Your comprehensive savings assessment report has been generated and downloaded.

Report ID: ${result.reportId}

The report includes:
✅ Your calculated savings: $${results?.annualSavings?.toLocaleString() || '0'}/year
✅ ROI analysis and break-even timeline
✅ Available rebates and incentives (up to $30,000 total)
✅ Step-by-step installation process

Email notification sent to: ${formData.email}
CC: info@geopioneer.com

We'll contact you within 24 hours to schedule your on-site evaluation.`)
                          } else {
                            alert(`Error: ${result.message}. Please try again or contact us directly at (555) 123-4567.`)
                          }
                        } catch (error) {
                          console.error('Report generation error:', error)
                          alert('There was an issue generating your report. Please try again or contact us directly at (555) 123-4567.')
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                    >
                      📄 Generate Report & Submit Assessment
                    </Button>
                  </div>
                  
                  <div className="mt-4 text-center text-sm text-gray-600">
                    <p>Your report will include detailed savings calculations, available rebates, and installation timeline.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

          {/* Calculate Button */}
          <div className="mt-8 text-center">
            <Button 
              size="lg" 
              onClick={calculateSavings}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-3"
            >
              Calculate My Savings
            </Button>
          </div>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Our Calculator is Different
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Zap className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                <CardTitle>Accurate Energy Modeling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Based on actual Massachusetts energy prices and geothermal COP values of 4+ winter, 6+ summer
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-4" />
                <CardTitle>Real Incentive Calculations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Includes current MassSave $15K rebate and 30% federal tax credit calculations
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-4" />
                <CardTitle>Long-term Projections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  See 10-year and 25-year savings projections to understand total lifetime value
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CalculatorPage
