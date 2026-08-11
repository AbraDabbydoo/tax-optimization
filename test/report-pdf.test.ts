import { buildReportContent } from '@/lib/report-pdf'

describe('buildReportContent', () => {
  it('creates a structured report payload from results and context', () => {
    const content = buildReportContent({
      results: [
        {
          stateCode: 'DE',
          stateName: 'Delaware',
          totalTaxBurden: 1200,
          incomeTaxBurden: 300,
          retirementTaxBurden: 100,
          propertyTaxBurden: 400,
          salesTaxBurden: 300,
          vehicleTaxBurden: 100,
        },
      ],
      currentStateCode: 'DE',
      currentStateTax: 1200,
      currentStateTaxBreakdown: {
        incomeTaxBurden: 300,
        retirementTaxBurden: 100,
        propertyTaxBurden: 400,
        salesTaxBurden: 300,
        vehicleTaxBurden: 100,
      },
      userLifestyle: 'balanced',
      userRegion: 'suburban',
      data: {
        residenceState: 'DE',
        filingStatus: 'single',
        annualIncome: 100000,
      },
    })

    expect(content.title).toBe('WhereTax Tax Optimization Report')
    expect(content.summary.residenceState).toBe('DE')
    expect(content.summary.filingStatus).toBe('single')
    expect(content.summary.annualIncome).toBe(100000)
    expect(content.recommendations).toHaveLength(1)
    expect(content.recommendations[0].stateCode).toBe('DE')
    expect(content.recommendations[0].totalTaxBurden).toBe(1200)
  })
})
