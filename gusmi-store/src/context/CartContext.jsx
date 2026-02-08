import React, { createContext, useState, useContext, useEffect } from 'react';
import { getActivePrice } from '../utils/productUtils';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            return [];
        }
    });

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }, [cart]);

    const getEffectivePrice = (product) => {
        return getActivePrice(product);
    };

    const addToCart = (product, quantity = 1) => {
        const maxStock = product.is_preorder ? 99 : product.stock;
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                const newQty = Math.min(existingItem.quantity + quantity, maxStock);
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: newQty }
                        : item
                );
            }
            const effectivePrice = getEffectivePrice(product);
            return [...prevCart, { ...product, quantity: Math.min(quantity, maxStock), effective_price: effectivePrice }];
        });
        setIsOpen(true);
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCart(prevCart =>
            prevCart.map(item => {
                if (item.id !== productId) return item;
                const maxStock = item.is_preorder ? 99 : item.stock;
                return { ...item, quantity: Math.min(newQuantity, maxStock) };
            })
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartTotal = cart.reduce((total, item) => {
        const price = item.effective_price || parseFloat(item.retail_price);
        return total + price * item.quantity;
    }, 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    const toggleCart = () => setIsOpen(!isOpen);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount,
            isOpen,
            toggleCart,
            setIsOpen
        }}>
            {children}
        </CartContext.Provider>
    );
};
