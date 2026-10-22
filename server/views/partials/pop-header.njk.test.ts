import * as cheerio from 'cheerio'
import httpMocks from 'node-mocks-http'
import { RiskData } from '@ministryofjustice/hmpps-arns-frontend-components-lib'
import { RoshRiskWidgetDto } from '../../data/model/risk'
import { createNunjucksTestEnv } from '../../testutils/nunjucksTestEnv'
import { RiskBadgeData } from '../../utils/personRiskFlagSorter'

type TestModel = {
  flags: Record<string, boolean>
  rosh: { level: string }
  risksWidget: RoshRiskWidgetDto
  riskBadgeData: RiskBadgeData
  riskData: RiskData
  headerCRN: string
  managedBy?: { text: string; name?: string; location?: string; href?: string }
  personPhotoSrc?: string
  arnsUnavailable?: boolean
  prisonsUnavailable?: boolean
  collapsibleRiskFlags?: boolean
}

const riskBadgeData: RiskBadgeData = {
  groups: [
    {
      severity: 'MEDIUM',
      badges: [
        {
          id: 1,
          text: 'Risk to children - Medium',
          level: 'MEDIUM',
          badgeClass: 'risk-badge--medium',
        },
        {
          id: 2,
          text: 'Risk to staff - Medium',
          level: 'MEDIUM',
          badgeClass: 'risk-badge--medium',
        },
        {
          id: 3,
          text: 'Risk to known adult - Medium',
          level: 'MEDIUM',
          badgeClass: 'risk-badge--medium',
        },
        {
          id: 4,
          text: 'Risk to prisoner - Medium',
          level: 'MEDIUM',
          badgeClass: 'risk-badge--medium',
        },
        {
          id: 5,
          text: 'Risk to public - Medium',
          level: 'MEDIUM',
          badgeClass: 'risk-badge--medium',
        },
        {
          id: 6,
          text: 'Medium rosh',
          level: 'MEDIUM',
          badgeClass: 'risk-badge--medium',
        },
      ],
    },
  ],
  remainingCount: 0,
}

const riskData = (assessments = {} as any): RiskData => ({
  assessments: [
    {
      outputVersion: '2',
      completedDate: '09 June 2026',
      completedDateTime: '09 June 2026 at 10:27',
      assessmentType: 'layer 1',
      allReoffendingPredictor: {
        name: 'All reoffending predictor',
        band: 'LOW',
        staticOrDynamic: 'Dynamic',
        score: 11.94,
        completedDate: '09 June 2026',
      },
      violentReoffendingPredictor: {
        name: 'Violent reoffending predictor',
        band: 'LOW',
        staticOrDynamic: 'Dynamic',
        score: 10.58,
        completedDate: '09 June 2026',
      },
      seriousViolentReoffendingPredictor: {
        name: 'Serious violent reoffending predictor',
        band: 'LOW',
        staticOrDynamic: 'Dynamic',
        score: 0.18,
        completedDate: '09 June 2026',
      },
      directContactSexualReoffendingPredictor: {
        name: 'Direct contact – sexual reoffending predictor',
        band: 'NOT APPLICABLE',
        staticOrDynamic: null,
        score: 0,
        completedDate: '09 June 2026',
      },
      indirectImageContactSexualReoffendingPredictor: {
        name: 'Images and indirect contact – sexual reoffending predictor',
        band: 'NOT APPLICABLE',
        staticOrDynamic: null,
        score: 0,
        completedDate: '09 June 2026',
      },
      combinedSeriousReoffendingPredictor: {
        name: 'Combined serious reoffending predictor',
        band: 'LOW',
        staticOrDynamic: 'Dynamic',
        score: 0.18,
        completedDate: '09 June 2026',
      },
      ...assessments,
    },
  ],
  httpStatus: 200,
})

const baseModel: TestModel = {
  headerCRN: 'X000001',
  flags: {
    enableNDeliusRosh: true,
    enablePersonHeader: false,
    enableSupervisionPackagePoPHeader: false,
  },
  rosh: {
    level: 'HIGH',
  },
  riskBadgeData,
  riskData: riskData(),
  risksWidget: {
    overallRisk: 'MEDIUM',
    assessedOn: '2026-06-09T10:27:01',
    risks: [
      { riskTo: 'Children', community: 'MEDIUM', custody: 'MEDIUM' },
      { riskTo: 'Public', community: 'MEDIUM', custody: 'MEDIUM' },
      { riskTo: 'Known Adult', community: 'MEDIUM', custody: 'MEDIUM' },
      { riskTo: 'Staff', community: 'MEDIUM', custody: 'MEDIUM' },
      { riskTo: 'Prisoners', community: 'N/A', custody: 'MEDIUM' },
    ],
  },
}

const render = (model = {} as Partial<TestModel>) => {
  const input = {
    ...baseModel,
    ...model,
  }
  const req = httpMocks.createRequest()
  const res = httpMocks.createResponse({
    locals: input,
  })
  const env = createNunjucksTestEnv(req, res)
  return cheerio.load(env.render('partials/pop-header.njk', input))
}
describe('POP header', () => {
  describe('enableNDeliusRosh feature flag enabled', () => {
    it('should render the ROSH badge with NDelius data', () => {
      const $ = render()
      expect(
        $('.moj-page-header-actions .moj-page-header-actions__title')
          .find('[data-badge-base="Risk of serious harm HIGH"]')
          .find('span')
          .text(),
      ).toContain('Risk of serious harm')
      expect(
        $('.moj-page-header-actions .moj-page-header-actions__title')
          .find('[data-badge-base="Risk of serious harm HIGH"]')
          .hasClass('arns-badge-base--high'),
      ).toBe(true)
      expect(
        $('.moj-page-header-actions .moj-page-header-actions__title')
          .find('[data-badge-base="Risk of serious harm HIGH"]')
          .find('span')
          .find('strong')
          .text(),
      ).toContain('HIGH')
    })

    it('should render the ROSH badge from NDelius even when the ARNS combined predictor is NOT APPLICABLE', () => {
      const $ = render({
        riskData: riskData({
          combinedSeriousReoffendingPredictor: {
            name: 'Combined serious reoffending predictor',
            band: 'NOT APPLICABLE',
          },
        }),
      })
      expect(
        $('.moj-page-header-actions .moj-page-header-actions__title')
          .find('[data-badge-base="Risk of serious harm HIGH"]')
          .find('span')
          .text(),
      ).toContain('Risk of serious harm')
      expect(
        $('.moj-page-header-actions .moj-page-header-actions__title').find(
          '[data-badge-base="Combined serious reoffending predictor NOT APPLICABLE"]',
        ).length,
      ).toBe(0)
    })

    it('should not render a ROSH badge when rosh.level is undefined', () => {
      const $ = render({ rosh: { level: undefined } })
      expect(
        $('.moj-page-header-actions .moj-page-header-actions__title').find('[data-badge-base^="Risk of serious harm"]')
          .length,
      ).toBe(0)
    })
  })
  describe('enableNDeliusRosh feature flag is disabled', () => {
    it(`should render the ROSH badge with 'Risk of serious harm' label and ARNS data`, () => {
      const $ = render({ flags: { ...baseModel.flags, enableNDeliusRosh: false } })
      expect(
        $('.moj-page-header-actions .moj-page-header-actions__title')
          .find('[data-badge-base="Risk of serious harm MEDIUM"]')
          .find('span')
          .text(),
      ).toContain('Risk of serious harm')
      expect(
        $('.moj-page-header-actions .moj-page-header-actions__title')
          .find('[data-badge-base="Risk of serious harm MEDIUM"]')
          .hasClass('arns-badge-base--medium'),
      ).toBe(true)
      expect(
        $('.moj-page-header-actions .moj-page-header-actions__title')
          .find('[data-badge-base="Risk of serious harm MEDIUM"]')
          .find('span')
          .find('strong')
          .text(),
      ).toContain('MEDIUM')
    })
    it(`should render the ROSH badge with 'ROSH' label and ARNS data`, () => {
      const $ = render({
        flags: { ...baseModel.flags, enableNDeliusRosh: false },
        riskData: riskData({ rsr: { band: 'LOW' } }),
      })
      expect(
        $('.moj-page-header-actions .moj-page-header-actions__title')
          .find('[data-badge-base="ROSH MEDIUM"]')
          .find('span')
          .text(),
      ).toContain('ROSH')
      expect(
        $('.moj-page-header-actions .moj-page-header-actions__title')
          .find('[data-badge-base="ROSH MEDIUM"]')
          .hasClass('arns-badge-base--medium'),
      ).toBe(true)
      expect(
        $('.moj-page-header-actions .moj-page-header-actions__title')
          .find('[data-badge-base="ROSH MEDIUM"]')
          .find('span')
          .find('strong')
          .text(),
      ).toContain('MEDIUM')
    })

    it(`should render the ROSH badge with a 'VERY HIGH' label when overallRisk is VERY_HIGH`, () => {
      const $ = render({
        flags: { ...baseModel.flags, enableNDeliusRosh: false },
        risksWidget: { ...baseModel.risksWidget, overallRisk: 'VERY_HIGH' },
      })
      expect(
        $('.moj-page-header-actions .moj-page-header-actions__title')
          .find('[data-badge-base="Risk of serious harm VERY HIGH"]')
          .hasClass('arns-badge-base--very-high'),
      ).toBe(true)
      expect(
        $('.moj-page-header-actions .moj-page-header-actions__title')
          .find('[data-badge-base="Risk of serious harm VERY HIGH"]')
          .find('span')
          .find('strong')
          .text(),
      ).toContain('VERY HIGH')
    })

    it('should not render any badges when the ARNS combined predictor is NOT APPLICABLE', () => {
      const $ = render({
        flags: { ...baseModel.flags, enableNDeliusRosh: false },
        riskData: riskData({
          combinedSeriousReoffendingPredictor: {
            name: 'Combined serious reoffending predictor',
            band: 'NOT APPLICABLE',
          },
        }),
      })
      expect($('.moj-page-header-actions .moj-page-header-actions__title').find('[data-badge-base]').length).toBe(1)
      expect(
        $('.moj-page-header-actions .moj-page-header-actions__title').find(
          '[data-badge-base="Combined serious reoffending predictor NOT APPLICABLE"]',
        ).length,
      ).toBe(0)
      expect(
        $('.moj-page-header-actions .moj-page-header-actions__title').find(
          '[data-badge-base="Risk of serious harm MEDIUM"]',
        ).length,
      ).toBe(1)
    })
  })

  describe('enablePersonHeader feature flag enabled', () => {
    const renderPersonHeader = (model = {} as Partial<TestModel>) =>
      render({ ...model, flags: { ...baseModel.flags, ...model.flags, enablePersonHeader: true } })

    describe('enableNDeliusRosh feature flag enabled', () => {
      it('should render the ROSH badge with NDelius data', () => {
        const $ = renderPersonHeader()
        expect(
          $('.pop-header-risk-badges').find('[data-badge-base="Risk of serious harm HIGH"]').find('span').text(),
        ).toContain('Risk of serious harm')
        expect(
          $('.pop-header-risk-badges')
            .find('[data-badge-base="Risk of serious harm HIGH"]')
            .hasClass('arns-badge-base--high'),
        ).toBe(true)
        expect(
          $('.pop-header-risk-badges')
            .find('[data-badge-base="Risk of serious harm HIGH"]')
            .find('span')
            .find('strong')
            .text(),
        ).toContain('HIGH')
      })

      it('should render the ROSH badge from NDelius even when the ARNS combined predictor is NOT APPLICABLE', () => {
        const $ = renderPersonHeader({
          riskData: riskData({
            combinedSeriousReoffendingPredictor: {
              name: 'Combined serious reoffending predictor',
              band: 'NOT APPLICABLE',
            },
          }),
        })
        expect(
          $('.pop-header-risk-badges').find('[data-badge-base="Risk of serious harm HIGH"]').find('span').text(),
        ).toContain('Risk of serious harm')
        expect(
          $('.pop-header-risk-badges').find('[data-badge-base="Combined serious reoffending predictor NOT APPLICABLE"]')
            .length,
        ).toBe(0)
      })

      it('should not render a ROSH badge when rosh.level is undefined', () => {
        const $ = renderPersonHeader({ rosh: { level: undefined } })
        expect($('.pop-header-risk-badges').find('[data-badge-base^="Risk of serious harm"]').length).toBe(0)
      })
    })
    describe('enableNDeliusRosh feature flag is disabled', () => {
      it(`should render the ROSH badge with 'Risk of serious harm' label and ARNS data`, () => {
        const $ = renderPersonHeader({ flags: { ...baseModel.flags, enableNDeliusRosh: false } })
        expect(
          $('.pop-header-risk-badges').find('[data-badge-base="Risk of serious harm MEDIUM"]').find('span').text(),
        ).toContain('Risk of serious harm')
        expect(
          $('.pop-header-risk-badges')
            .find('[data-badge-base="Risk of serious harm MEDIUM"]')
            .hasClass('arns-badge-base--medium'),
        ).toBe(true)
        expect(
          $('.pop-header-risk-badges')
            .find('[data-badge-base="Risk of serious harm MEDIUM"]')
            .find('span')
            .find('strong')
            .text(),
        ).toContain('MEDIUM')
      })
      it(`should render the ROSH badge with 'ROSH' label and ARNS data`, () => {
        const $ = renderPersonHeader({
          flags: { ...baseModel.flags, enableNDeliusRosh: false },
          riskData: riskData({ rsr: { band: 'LOW' } }),
        })
        expect($('.pop-header-risk-badges').find('[data-badge-base="ROSH MEDIUM"]').find('span').text()).toContain(
          'ROSH',
        )
        expect(
          $('.pop-header-risk-badges').find('[data-badge-base="ROSH MEDIUM"]').hasClass('arns-badge-base--medium'),
        ).toBe(true)
        expect(
          $('.pop-header-risk-badges').find('[data-badge-base="ROSH MEDIUM"]').find('span').find('strong').text(),
        ).toContain('MEDIUM')
      })

      it(`should render the ROSH badge with a 'VERY HIGH' label when overallRisk is VERY_HIGH`, () => {
        const $ = renderPersonHeader({
          flags: { ...baseModel.flags, enableNDeliusRosh: false },
          risksWidget: { ...baseModel.risksWidget, overallRisk: 'VERY_HIGH' },
        })
        expect(
          $('.pop-header-risk-badges')
            .find('[data-badge-base="Risk of serious harm VERY HIGH"]')
            .hasClass('arns-badge-base--very-high'),
        ).toBe(true)
        expect(
          $('.pop-header-risk-badges')
            .find('[data-badge-base="Risk of serious harm VERY HIGH"]')
            .find('span')
            .find('strong')
            .text(),
        ).toContain('VERY HIGH')
      })

      it('should not render any badges when the ARNS combined predictor is NOT APPLICABLE', () => {
        const $ = renderPersonHeader({
          flags: { ...baseModel.flags, enableNDeliusRosh: false },
          riskData: riskData({
            combinedSeriousReoffendingPredictor: {
              name: 'Combined serious reoffending predictor',
              band: 'NOT APPLICABLE',
            },
          }),
        })
        expect($('.pop-header-risk-badges').find('[data-badge-base]').length).toBe(0)
      })
    })

    describe('risk flag badges', () => {
      it('should render a link for each risk flag badge', () => {
        const $ = renderPersonHeader()
        riskBadgeData.groups[0].badges.forEach(badge => {
          const link = $(`[data-qa="risk-badge-${badge.id}"]`)
          expect(link.attr('href')).toBe(`/case/${baseModel.headerCRN}/risk/flag/${badge.id}`)
          expect(link.hasClass(badge.badgeClass)).toBe(true)
          expect(link.text().replace(/\s+/g, ' ').trim()).toContain(badge.text)
        })
      })

      it('should not render a "+N active risk flags" link when remainingCount is 0', () => {
        const $ = renderPersonHeader()
        expect($('[data-qa="risk-badge-more"]').length).toBe(0)
      })

      it('should render a "+N active risk flags" link when remainingCount is greater than 0', () => {
        const $ = renderPersonHeader({ riskBadgeData: { ...riskBadgeData, remainingCount: 3 } })
        const link = $('[data-qa="risk-badge-more"]')
        expect(link.attr('href')).toBe(`/case/${baseModel.headerCRN}/risk`)
        expect(link.text().trim()).toBe('+3 active risk flags')
      })
    })

    describe('risk badge order', () => {
      const rsr = { name: 'RSR', band: 'LOW', score: 0.77, staticOrDynamic: 'Static' }
      const badgeOrder = ($: cheerio.CheerioAPI) =>
        $('.pop-header-risk-badges [data-badge-base]')
          .map((_i, el) => $(el).attr('data-badge-base'))
          .get()

      it('shows the risk of serious harm badge first, then the combined serious reoffending predictor', () => {
        const $ = renderPersonHeader({ riskData: riskData({ rsr }) })
        expect(badgeOrder($)).toEqual([
          'Risk of serious harm HIGH',
          'Combined serious reoffending predictor LOW',
          'RSR LOW',
        ])
      })

      it('shows the ARNS ROSH badge first when enableNDeliusRosh is off', () => {
        const $ = renderPersonHeader({
          flags: { ...baseModel.flags, enableNDeliusRosh: false },
          riskData: riskData({ rsr }),
        })
        expect(badgeOrder($)).toEqual(['ROSH MEDIUM', 'Combined serious reoffending predictor LOW', 'RSR LOW'])
      })
    })

    describe('person details', () => {
      it('should render the managed by link and the photo', () => {
        const $ = renderPersonHeader({
          managedBy: {
            text: 'Jack Frost (Worksop Probation Office)',
            name: 'Jack Frost',
            location: 'Worksop Probation Office',
            href: '/case/X000001/personal-details/staff-contacts',
          },
          personPhotoSrc: '/search/prisoner-image/A1234BC',
        })
        expect($('[data-qa="managedBy"]').text().trim()).toBe('Jack Frost (Worksop Probation Office)')
        expect($('[data-qa="managedBy"]').attr('href')).toBe('/case/X000001/personal-details/staff-contacts')
        expect($('[data-qa="personPhoto"]').attr('src')).toBe('/search/prisoner-image/A1234BC')
      })

      it('should not render the legacy header', () => {
        const $ = renderPersonHeader()
        expect($('.moj-page-header-actions').length).toBe(0)
      })
    })

    describe('header errors', () => {
      it('should show an error when photos and risk information are unavailable', () => {
        const $ = renderPersonHeader({ arnsUnavailable: true, prisonsUnavailable: true })
        const errors = $('[data-qa="headerErrors"]').text()
        expect(errors).toContain('Photos and throughcare information are currently unavailable.')
        expect(errors).toContain('Risk information from the ARNS service is currently unavailable.')
      })

      it('should still render the header and risk flags when the ARNS risk data is missing', () => {
        const $ = renderPersonHeader({ arnsUnavailable: true, riskData: null as unknown as RiskData })
        expect($('.person-header').length).toBe(1)
        expect($('[data-qa="personRiskBadges"]').length).toBe(1)
        expect($('[data-qa="headerErrors"]').text()).toContain('Risk information from the ARNS service')
      })

      it('should not show an error when everything is available', () => {
        const $ = renderPersonHeader()
        expect($('[data-qa="headerErrors"]').length).toBe(0)
      })
    })

    describe('collapsible risk flags', () => {
      it('should render the risk flags toggle when collapsibleRiskFlags is set', () => {
        const $ = renderPersonHeader({ collapsibleRiskFlags: true })
        const toggle = $('[data-qa="riskFlagsToggle"]')
        expect(toggle.text().trim()).toBe('Hide active NDelius risk flags')
        expect(toggle.attr('aria-controls')).toBe($('[data-qa="personRiskBadges"]').attr('id'))
      })

      it('should not render the risk flags toggle by default', () => {
        const $ = renderPersonHeader()
        expect($('[data-qa="riskFlagsToggle"]').length).toBe(0)
      })
    })
  })
})
