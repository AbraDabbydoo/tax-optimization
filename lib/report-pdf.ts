export interface ReportLineItem {
  label: string
  value: string
}

export interface ReportRecommendation {
  stateCode: string
  stateName: string
  totalTaxBurden: number
  incomeTaxBurden: number
  retirementTaxBurden: number
  propertyTaxBurden: number
  salesTaxBurden: number
  vehicleTaxBurden: number
}

export interface ReportContent {
  title: string
  generatedAt: string
  summary: {
    residenceState: string
    filingStatus: string
    annualIncome: number | string
    lifestyle: string
    region: string
  }
  recommendations: ReportRecommendation[]
}

export function buildReportContent(params: {
  results: any[]
  currentStateCode: string
  currentStateTax: number
  currentStateTaxBreakdown: Record<string, number>
  userLifestyle: string
  userRegion: string
  data?: Record<string, any>
}): ReportContent {
  const data = params.data || {}

  return {
    title: 'WhereTax Tax Optimization Report',
    generatedAt: new Date().toISOString(),
    summary: {
      residenceState: params.currentStateCode || data.residenceState || 'Unknown',
      filingStatus: data.filingStatus || 'Unknown',
      annualIncome: data.annualIncome || 0,
      lifestyle: params.userLifestyle || 'Not provided',
      region: params.userRegion || 'Not provided',
    },
    recommendations: (params.results || []).map((result: any) => ({
      stateCode: result.stateCode || '',
      stateName: result.stateName || result.stateCode || '',
      totalTaxBurden: Number(result.totalTaxBurden || 0),
      incomeTaxBurden: Number(result.incomeTaxBurden || 0),
      retirementTaxBurden: Number(result.retirementTaxBurden || 0),
      propertyTaxBurden: Number(result.propertyTaxBurden || 0),
      salesTaxBurden: Number(result.salesTaxBurden || 0),
      vehicleTaxBurden: Number(result.vehicleTaxBurden || 0),
    })),
  }
}

export function formatReportLines(content: ReportContent): ReportLineItem[] {
  const lines: ReportLineItem[] = [
    { label: 'Title', value: content.title },
    { label: 'Generated', value: content.generatedAt },
    { label: 'Residence State', value: content.summary.residenceState },
    { label: 'Filing Status', value: String(content.summary.filingStatus) },
    { label: 'Annual Income', value: String(content.summary.annualIncome) },
    { label: 'Lifestyle', value: content.summary.lifestyle },
    { label: 'Region', value: content.summary.region },
  ]

  content.recommendations.forEach((recommendation, index) => {
    lines.push({ label: `Recommendation ${index + 1} - State`, value: recommendation.stateCode })
    lines.push({ label: `Recommendation ${index + 1} - Total Tax`, value: `$${recommendation.totalTaxBurden}` })
  })

  return lines
}

function escapePdfText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function createSimplePdfBlob(lines: string[]): Blob {
  const contentLines = lines.map((line) => line.trim())
  const contentStream = contentLines
    .map((line, index) => {
      const y = 760 - index * 14
      return `BT /F1 12 Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`
    })
    .join('\n')

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length 0 >>\nstream\n${contentStream}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ]

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = [0]
  objects.forEach((obj) => {
    offsets.push(pdf.length)
    pdf += obj
  })

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`

  return new Blob([pdf], { type: 'application/pdf' })
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer()
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(arrayBuffer).toString('base64')
  }

  let binary = ''
  const bytes = new Uint8Array(arrayBuffer)
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

export async function downloadReportPdf(content: ReportContent, options?: { fileName?: string }) {
  const lines = formatReportLines(content).map((item) => `${item.label}: ${item.value}`)
  const blob = createSimplePdfBlob(lines)
  const fileName = options?.fileName || 'where-tax-report.pdf'
  const base64 = await blobToBase64(blob)

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.URL.revokeObjectURL(url)
  }

  return { blob, fileName, base64 }
}
