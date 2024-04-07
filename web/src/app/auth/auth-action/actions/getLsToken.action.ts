import { PRODUCT_NAME } from "typlib";
import { IAuthAction } from "../auth-action.model";
import { Inject, Injectable } from "@angular/core";

@Injectable()
export class GetProductAuthTokenAction implements IAuthAction {

  constructor (
    @Inject(PRODUCT_NAME) private readonly productName: string
  ) {}

  public execute () {
    return localStorage.getItem(`${this.productName}__authToken`);
  }

}
