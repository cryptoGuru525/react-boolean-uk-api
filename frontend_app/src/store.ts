import create from "zustand";

export type UserType = {
  id: Number;
  name: string;
  phone_number: Number;
};

export type ShopType = {
  id: Number;
  name: string;
  image: string;
  postcode: string;
  estimateTime: Number;
  pendingCupOfCoffee: Number;
};

type CartType = {
  estimateTime?: Number;
  userId?: Number;
  shop_id?: Number;
  coffee?: CoffeeTypeInCart;
};

type CoffeeTypeInCart = {
  quantity: Number;
  coffeeId: Number;
  specialRequest: SpecialRequestTypeInCart;
};

type SpecialRequestTypeInCart = {
  specialRequestId: Number;
};

export type CoffeeType = {
  id: Number;
  name: string;
  size: Number;
  price: Number;
  description: string;
  ice: boolean;
  image: string;
};

type Object = {
  [key: string]: string;
};

type StoreType = {
  loginRole: null | "user" | "shop";
  selectRole: (role: "user" | "shop") => void;
  setLogInUser: (e: React.SyntheticEvent) => void;
  loginError: null | undefined | "failToCreate";
  loginUser: null | UserType;
  setNewUser: (name: undefined | string, phone: string | null) => void;
  shops: ShopType[];
  fetchShops: () => void;
  cart: CartType | null;
  addShopIdToCart: (id: Number) => void;
  coffeeList: CoffeeType[] | [];
  fetchCoffeeList: () => void;
  selectedCoffee: CoffeeType | null;
  setSelectedCoffee: (name: string) => void;
};

const useStore = create<StoreType>((set, get) => ({
  loginRole: null,
  selectRole: role => {
    if (get().loginRole === role) set({ loginRole: null });
    else set({ loginRole: role });
  },
  loginError: null,
  loginUser: null,
  setLogInUser: async e => {
    const target = e.target as typeof e.target & {
      phone: { value: string };
    };
    const data = await fetch(
      `http://localhost:3000/users/${target.phone.value}`
    ).then(res => res.json());

    if (data) set({ loginUser: data });
    else set({ loginError: undefined });
  },
  setNewUser: async (name, phone) => {
    const submitNewUser = {
      name,
      phone_number: Number(phone),
    };
    console.log(submitNewUser);
    const createdUser = await fetch(`http://localhost:3000/users/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submitNewUser),
    }).then(res => res.json());

    if (createdUser.Error) set({ loginError: "failToCreate" });
    else set({ loginUser: createdUser });
  },

  shops: [],
  fetchShops: () => {
    fetch("http://localhost:3000/shops/")
      .then(res => res.json())
      .then(shopsList => {
        fetch("http://localhost:3000/shops/estimateTime")
          .then(res => res.json())
          .then(shopsEstimateTime => {
            const completeShopList = shopsList.map((shop: ShopType) => {
              for (const shopTime of shopsEstimateTime) {
                if (shopTime.postcode === shop.postcode)
                  return { ...shop, ...shopTime };
              }
            });
            set({ shops: completeShopList });
          });
      });
  },

  cart: null,
  addShopIdToCart: id => {
    set({ cart: { shop_id: id } });

    // const currntCart = get().cart;
    // set({ cart: { ...currntCart, shop_id: id } });
  },

  coffeeList: [],
  fetchCoffeeList: () => {
    fetch("http://localhost:3000/coffee")
      .then(res => res.json())
      .then(coffee => set({ coffeeList: coffee }));
  },

  selectedCoffee: null,
  setSelectedCoffee: coffeeName => {
    const fetchSelectedCoffee = (name: string) => {
      fetch(`http://localhost:3000/coffee/${name}`)
        .then(res => res.json())
        .then(coffee => set({ selectedCoffee: coffee }));
    };
  },
}));

export default useStore;
