import { AppError } from "../errors.js";
import type { SelectedAddress } from "../snappfood/types.js";

export class SelectedAddressState {
  private selectedAddress?: SelectedAddress;

  set(address: SelectedAddress): SelectedAddress {
    this.selectedAddress = address;
    return address;
  }

  get(): SelectedAddress {
    if (!this.selectedAddress) {
      throw new AppError(
        "NO_ADDRESS_SELECTED",
        "No Snappfood address is selected. Call get_saved_addresses, then select_address before searching restaurants."
      );
    }

    return this.selectedAddress;
  }
}
