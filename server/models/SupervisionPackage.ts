import type { MPoPComponents } from '@ministryofjustice/hmpps-mpop-frontend-components-lib'

// Derived from the library's own method signature so the shapes never drift apart
export type SupervisionPackageResponse = Awaited<ReturnType<MPoPComponents['getSupervisionPackageFrontendContext']>>
export type SupervisionPackage = NonNullable<SupervisionPackageResponse>
