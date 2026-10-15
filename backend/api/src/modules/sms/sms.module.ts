import { Global, Module } from "@nestjs/common";
import { CONFIG, SMS_PROVIDER } from "../../common/tokens";
import type { AppConfig } from "../../config/config";
import { AfricasTalkingSmsProvider } from "./africastalking.provider";
import { ConsoleSmsProvider } from "./console.provider";
import type { SmsProvider } from "./sms.provider";

@Global()
@Module({
  providers: [
    {
      provide: SMS_PROVIDER,
      inject: [CONFIG],
      useFactory: (c: AppConfig): SmsProvider =>
        c.SMS_PROVIDER === "africastalking"
          ? new AfricasTalkingSmsProvider({
              apiKey: c.AFRICAS_TALKING_API_KEY ?? "",
              username: c.AFRICAS_TALKING_USERNAME,
              senderId: c.AFRICAS_TALKING_SENDER_ID,
              baseUrl: c.AFRICAS_TALKING_BASE_URL,
            })
          : new ConsoleSmsProvider(),
    },
  ],
  exports: [SMS_PROVIDER],
})
export class SmsModule {}
