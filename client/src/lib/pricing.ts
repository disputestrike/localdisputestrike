import {
  AGENCY_PRICING,
  CONSUMER_PRICING,
  PRICING_DISPLAY,
  SMARTCREDIT_PRICING,
  formatPrice,
  formatPriceShort,
} from "@shared/pricing";

export {
  AGENCY_PRICING,
  CONSUMER_PRICING,
  PRICING_DISPLAY,
  SMARTCREDIT_PRICING,
  formatPrice,
  formatPriceShort,
};

export const CONSUMER_PRICE_LABELS = {
  essential: formatPrice(CONSUMER_PRICING.ESSENTIAL.monthlyPrice),
  complete: formatPrice(CONSUMER_PRICING.COMPLETE.monthlyPrice),
  essentialWithSmartCredit: PRICING_DISPLAY.ESSENTIAL_WITH_SMARTCREDIT,
  completeWithSmartCredit: PRICING_DISPLAY.COMPLETE_WITH_SMARTCREDIT,
};

export const AGENCY_PRICE_LABELS = {
  starter: formatPriceShort(AGENCY_PRICING.STARTER.price),
  professional: formatPriceShort(AGENCY_PRICING.PROFESSIONAL.price),
  enterprise: formatPriceShort(AGENCY_PRICING.ENTERPRISE.price),
};
