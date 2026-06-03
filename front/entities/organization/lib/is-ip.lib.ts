import type { Organization } from "../model/organization.type"

export function isIp(org: Pick<Organization, "fullOpf">): boolean {
  const opf = org.fullOpf.toLowerCase()
  return (
    opf.includes("индивидуальный предприниматель") ||
    opf.includes(" ип") ||
    org.fullOpf.startsWith("ИП")
  )
}
