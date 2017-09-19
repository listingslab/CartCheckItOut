<?php

class Aligent_CartCheckItOut_Block_Cart extends Aligent_CartCheckItOut_Block_Base {

    const XML_INCHOO_CUSTOMER_SOCIALGOOGLE_ENABLED = 'customer/inchoo_socialconnect_google/enabled';
    const XML_INCHOO_CUSTOMER_SOCIALFACEBOOK_ENABLED = 'customer/inchoo_socialconnect_facebook/enabled';
    const XML_INCHOO_CUSTOMER_SOCIALTWITTER_ENABLED = 'customer/inchoo_socialconnect_twitter/enabled';
    const XML_INCHOO_CUSTOMER_SOCIALLINKEDIN_ENABLED = 'customer/inchoo_socialconnect_linkedin/enabled';

    private $_cart = null;

    private function getCart() {
        if ($this->_cart === null) {
            $this->_cart = $this->getDataHelper()->getCartItems();
        }
        return $this->_cart;
    }

    // Check if any of the inchoo social logins are enabled
    public function hasSocialSignin() {
        return (
            Mage::getStoreConfigFlag(self::XML_INCHOO_CUSTOMER_SOCIALGOOGLE_ENABLED) ||
            Mage::getStoreConfigFlag(self::XML_INCHOO_CUSTOMER_SOCIALFACEBOOK_ENABLED) ||
            Mage::getStoreConfigFlag(self::XML_INCHOO_CUSTOMER_SOCIALTWITTER_ENABLED) ||
            Mage::getStoreConfigFlag(self::XML_INCHOO_CUSTOMER_SOCIALLINKEDIN_ENABLED)
        );
    }

    public function getCartItems() {
        return $this->getCart();
    }

    public function getCartCount() {
        return count($this->getCart());
    }

    public function isCartEmpty() {
        return ($this->getCartCount() == 0) ? true : false;
    }

    public function isLoggedIn() {
        return $this->getCustomerHelper()->isLoggedIn();
    }

    public function isGuestSet() {
        return $this->getCustomerHelper()->isGuestSet();
    }

    public function getQuotesEmail() {
        return $this->getQuoteHelper()->getEmail();
    }

    public function getGoogleMapsUrl() {
        return $this->getDataHelper()->getGoogleMapsUrl();
    }

    public function guestCheckoutEnabled() {
        return Mage::getStoreConfigFlag('checkout/options/guest_checkout');
    }

    public function getCustomerDetails($json=false) {
        // if ($this->isLoggedIn()) {
            list($shipping, $billing) = $this->getCustomerHelper()->getCustomerDetails();

            $customer = [
                'shipping' => $shipping,
                'billing' => $billing
            ];

            if ($json) {
                $customer = Mage::helper('core')->jsonEncode($customer);
            }

            return $customer;
        // }
        return array();
    }

    public function getSelectedPaymentMethod() {
        $currentPaymentMethod = $this->getQuoteHelper()->checkQuoteForPaymentMethod();
        if ($currentPaymentMethod !== null) {
            return $currentPaymentMethod;
        }

        return $this->getDataHelper()->getDefaultPaymentMethod();
    }

    public function getSelectedCountry() {
        return $this->getCustomerHelper()->getShippingCountry();
    }
}