<?php

class Aligent_CartCheckItOut_Helper_Base extends Mage_Core_Helper_Abstract
{
    const XML_DEFAULT_COUNTRY_PATH = 'general/country/default';

    protected $_checkoutSession = null;
    protected $_customerSession = null;
    protected $_cart = null;
    protected $_quote = null;
    protected $_customer = null;
    protected $_defaultCountry = null;

    protected function _getCheckoutSession() {
        if ($this->_checkoutSession === null) {
            $this->_checkoutSession = Mage::getSingleton('checkout/session');
        }
        return $this->_checkoutSession;
    }

    protected function _getCustomerSession() {
        if ($this->_customerSession === null) {
            $this->_customerSession = Mage::getSingleton('customer/session');
        }
        return $this->_customerSession;
    }

    protected function _getCart() {
        if ($this->_cart === null) {
            $this->_cart = Mage::getSingleton('checkout/cart');
        }
        return $this->_cart;
    }

    protected function _getQuote() {
        if ($this->_quote === null) {
            $this->_quote = $this->_getCheckoutSession()->getQuote();
        }
        return $this->_quote;
    }

    protected function _getCustomer() {
        if($this->_customer === null) {
            $this->_customer = $this->_getCustomerSession()->getCustomer();
        }
        return $this->_customer;
    }

    public function getStoreDefaultCountry() {
        if ($this->_defaultCountry === null) {
            $this->_defaultCountry = Mage::getStoreConfig(self::XML_DEFAULT_COUNTRY_PATH);
        }
        return $this->_defaultCountry;
    }
}