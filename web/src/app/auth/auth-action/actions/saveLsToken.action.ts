import { PRODUCT_NAME } from "typlib";
import { IAuthAction } from "../auth-action.model";
import { Inject, Injectable } from "@angular/core";

@Injectable()
export class SaveTokenInLsAction implements IAuthAction {

  constructor (
    @Inject(PRODUCT_NAME) private readonly productName: string
  ) {}

  public execute (token: string) {
    return localStorage
    .setItem(`${this.productName}__authToken`, token);
  }

}
