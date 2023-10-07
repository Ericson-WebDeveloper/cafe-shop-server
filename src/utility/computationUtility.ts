import CartClass from "../class/CartClass";
import { ICartType } from "../types/Cart";
import { IProductType } from "../types/ProductType";
import { IUserType } from "../types/UserType";


export const computeTotalPriceOrder = async (carts: ICartType[]) => {
    return carts.reduce((total, cart) => {
        return total + cart.price * cart.qty
    }, 0);
}

export const computeTotalQtyOrder = async (carts: ICartType[]) => {
    return carts.reduce((total, cart) => {
        return total += cart.qty
    }, 0);
}