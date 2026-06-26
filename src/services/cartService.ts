import { cartModel, type ICart, type ICartItem } from "../models/cartModel.js";
import { orderModel, type IOrderItem } from "../models/orderModel.js";
import productModel from "../models/productModel.js";

interface CreateCartForUser {
  userId: string;
}

const createCartForUser = async ({ userId }: CreateCartForUser) => {
  const cart = await cartModel.create({ userId, totalAmount: 0 });
  await cart.save();
  return cart;
};

interface GetActiveCartForUser {
  userId: string;
  populateProduct?: boolean;
}
export const getActiveCartForUser = async ({
  userId,
  populateProduct,
}: GetActiveCartForUser) => {
  let cart;
  if (populateProduct) {
    cart = await cartModel
      .findOne({ userId, status: "active" })
      .populate("items.product");
  } else {
    cart = await cartModel.findOne({ userId, status: "active" });
  }
  if (!cart) {
    cart = await createCartForUser({ userId });
  }
  return cart;
};

interface ClearCart {
  userId: string;
}

export const clearCart = async ({ userId }: ClearCart) => {
  const cart = await getActiveCartForUser({ userId });

  cart.items = [];
  cart.totalAmount = 0;

  const updatedCart = await cart.save();
  return {
    data: await getActiveCartForUser({ userId, populateProduct: true }),
    statusCode: 200,
  };
};

interface AddItemToCart {
  productId: any;
  quantity: number;
  userId: string;
}
// export const addItemToCart = async ({
//   productId,
//   quantity,
//   userId,
// }: AddItemToCart) => {
//   const cart = await getActiveCartForUser({ userId });
//   const existsInCart = cart.items.find(
//     (p) => p.product.toString() === productId,
//   );

//   if (existsInCart) {
//     return { data: "Item already exits in cart!", statusCode: 400 };
//   }

//   const product = await productModel.findById(productId);
//   if (!product) {
//     return { data: " Product not found", statusCode: 400 };
//   }

//   if (product.stock < quantity) {
//     return { data: "Low stock for item", statusCode: 400 };
//   }
//   cart.items.push({
//     product: productId,
//     unitPrice: product.price,
//     quantity,
//   });
//   cart.totalAmount += product.price * quantity;
//   await cart.save();
//   return {
//     data: await getActiveCartForUser({ userId, populateProduct: true }),
//     statusCode: 200,
//   };
// };

export const addItemToCart = async ({
  productId,
  quantity,
  userId,
}: AddItemToCart) => {
  const cart = await getActiveCartForUser({ userId });

  const existsInCart = cart.items.find(
    (p) => p.product.toString() === productId,
  );

  const product = await productModel.findById(productId);
  if (!product) {
    return { data: "Product not found", statusCode: 400 };
  }

  //  toplam quantity kontrolü (önemli!)
  const newQuantity = existsInCart
    ? existsInCart.quantity + quantity
    : quantity;

  if (product.stock < newQuantity) {
    return { data: "Low stock for item", statusCode: 400 };
  }

  //  aynı ürün varsa artır, yoksa ekle
  if (existsInCart) {
    existsInCart.quantity = newQuantity;
  } else {
    cart.items.push({
      product: productId,
      unitPrice: product.price,
      quantity,
    });
  }

  // total HER ZAMAN yeniden hesaplanmalı
  cart.totalAmount = calculateCartTotalItems({
    cartItems: cart.items,
  });

  await cart.save();

  return {
    data: await getActiveCartForUser({ userId, populateProduct: true }),
    statusCode: 200,
  };
};
interface UpdateItemInCart {
  productId: any;
  quantity: number;
  userId: string;
}

export const updateItemInCart = async ({
  productId,
  quantity,
  userId,
}: UpdateItemInCart) => {
  const cart = await getActiveCartForUser({ userId });
  const existsInCart = cart.items.find(
    (p) => p.product.toString() === productId,
  );
  if (!existsInCart) {
    return { data: "item does not exits in cart", statusCode: 400 };
  }
  const product = await productModel.findById(productId);
  if (!product) {
    return { data: " Product not found", statusCode: 400 };
  }
  console.log(product.stock);
  if (product.stock < quantity) {
    return { data: "Low stock for item", statusCode: 400 };
  }

  const otherCartItems = cart.items.filter(
    (p) => p.product.toString() !== productId,
  );

  let total = calculateCartTotalItems({ cartItems: otherCartItems });

  existsInCart.quantity = quantity;
  total += existsInCart.quantity * existsInCart.unitPrice;
  cart.totalAmount = total;
  await cart.save();
  return {
    data: await getActiveCartForUser({ userId, populateProduct: true }),
    statusCode: 200,
  };
};

interface DeleteItemInCart {
  productId: any;
  userId: string;
}

export const deleteItemInCart = async ({
  userId,
  productId,
}: DeleteItemInCart) => {
  const cart = await getActiveCartForUser({ userId });
  const existsInCart = cart.items.find(
    (p) => p.product.toString() === productId,
  );
  if (!existsInCart) {
    return { data: "item does not exits in cart", statusCode: 400 };
  }

  const otherCartItems = cart.items.filter(
    (p) => p.product.toString() !== productId,
  );

  const total = calculateCartTotalItems({ cartItems: otherCartItems });

  cart.items = otherCartItems;
  cart.totalAmount = total;

  await cart.save();
  return {
    data: await getActiveCartForUser({ userId, populateProduct: true }),
    statusCode: 200,
  };
};

const calculateCartTotalItems = ({ cartItems }: { cartItems: ICartItem[] }) => {
  return cartItems.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice;
  }, 0);
};

interface Shipping {
  fullName: string;
  phone: string;
  city: string;
  address: string;
}

interface Checkout {
  userId: string;
  shipping: Shipping;
}

export const checkout = async ({ userId, shipping }: Checkout) => {
  const { fullName, phone, city, address } = shipping;

  // ✅ validation
  if (!fullName || !phone || !city || !address) {
    return { data: "Missing shipping information", statusCode: 400 };
  }

  const cart = await getActiveCartForUser({ userId });

  if (!cart || cart.items.length === 0) {
    return { data: "Cart is empty", statusCode: 400 };
  }

  const products = await Promise.all(
    cart.items.map((item) => productModel.findById(item.product)),
  );

  const orderItems: IOrderItem[] = cart.items.map((item, index) => {
    const product = products[index];

    if (!product) {
      throw new Error("Product not found");
    }

    return {
      productTitle: product.title,
      productImage: product.image,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    };
  });

  const order = await orderModel.create({
    orderNumber: `ORD-${Date.now()}`,
    orderItems,
    total: cart.totalAmount,
    shipping,
    userId,
  });

  cart.items = [];
  cart.totalAmount = 0;
  cart.status = "completed";
  await cart.save();

  return { data: order, statusCode: 200 };
};
