import { prisma } from './prisma'
import { getStripe } from './stripe'

export async function ensureStripeCustomer(contactId: string): Promise<string | null> {
  const stripe = getStripe()
  if (!stripe) return null

  const contact = await prisma.contact.findUnique({ where: { id: contactId } })
  if (!contact) return null

  if (contact.stripeCustomerId) {
    try {
      await stripe.customers.retrieve(contact.stripeCustomerId)
      return contact.stripeCustomerId
    } catch {
      await prisma.contact.update({
        where: { id: contact.id },
        data: { stripeCustomerId: null },
      })
    }
  }

  const customer = await stripe.customers.create({
    email: contact.email,
    name: contact.name,
    metadata: { contactId: contact.id, company: contact.company },
  })

  await prisma.contact.update({
    where: { id: contact.id },
    data: { stripeCustomerId: customer.id },
  })

  return customer.id
}
