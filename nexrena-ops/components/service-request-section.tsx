'use client'



import { ServiceRequestForm } from '@/components/service-request-form'

import type { PortalServiceRequest } from '@/lib/portal-types'



type Props = {

  onCreated: (request: PortalServiceRequest) => void

}



/** @deprecated Use ClientRequestModal + ServiceRequestForm in the client dashboard */

export function ServiceRequestSection({ onCreated }: Props) {

  return (

    <section>

      <h3 className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">Start a New Request</h3>

      <div className="glass-panel rounded-xl border border-slate-800/60 p-5">

        <ServiceRequestForm onCreated={onCreated} />

      </div>

    </section>

  )

}

