import { site } from '../../data/site'
import { IconClock, IconLocation, IconMail, IconPhone } from '../ui/Icons'

/** Grilli topbar: address ◇ hours … phone ◇ mail. Visible on wide screens only. */
export default function Topbar() {
  return (
    <div className="topbar">
      <div className="container">
        <address className="topbar-item">
          <IconLocation />
          <span className="span">{site.address}</span>
        </address>
        <div className="separator" />
        <div className="topbar-item item-2">
          <IconClock />
          <span className="span">{site.hoursShort}</span>
        </div>
        <a href={site.phoneHref} className="topbar-item link">
          <IconPhone />
          <span className="span">{site.phone}</span>
        </a>
        <div className="separator" />
        <a href={site.emailHref} className="topbar-item link">
          <IconMail />
          <span className="span">{site.email}</span>
        </a>
      </div>
    </div>
  )
}
