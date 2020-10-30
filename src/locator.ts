import {
  ssdpClient,
  SSDPClientEvents,
  SSDPNotifyEvent,
} from "@codersparks-home-assistant/ssdp-client";
import { EventEmitter } from "events";
import { URL } from "url";
import { getLogger } from "log4js";

const logger = getLogger("sky-box-locator");

export enum SkyQLocatorEvents {
  SKY_RC_EVENT = "urn:schemas-nds-com:service:SkyRC:2",
}
export class SkyQDevice {
  constructor(public id: string, public ipAddress: string) {}
}

class SkyQLocator extends EventEmitter {
  startDeviceLocation = () => {
    ssdpClient.on(
      SSDPClientEvents.SSDP_NOTIFY_MESSAGE_RECEIVED,
      (event: SSDPNotifyEvent) => {
        switch (event.nt) {
          case SkyQLocatorEvents.SKY_RC_EVENT: {
            const descriptionUrl = event.location;
            const ipAddr = new URL(descriptionUrl).host;
            const id = event.usn.split(":")[1];

            this.emit(
              SkyQLocatorEvents.SKY_RC_EVENT,
              new SkyQDevice(id, ipAddr)
            );
            break;
          }
          default:
            logger.debug("No handler for event schema: " + event.nt);
            break;
        }
      }
    );

    ssdpClient.startDeviceScan();
  };
}

export const skyQDeviceLocator = new SkyQLocator();
