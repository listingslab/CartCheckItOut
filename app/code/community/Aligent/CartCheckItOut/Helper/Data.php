<?php
/**
 * Aligent_CartCheckItOut
 *
 * @category   Aligent
 * @package    cartcheckitout
 * @copyright  Copyright (c) 2017 Aligent
 * @author     Chris Dorward <chris.dorward@aligent.com.au>
 *
 * app/code/community/Aligent/CheckItOut/Helper/Data.php
 * Helper functions for cart & checkout
 *
 */

class Aligent_CartCheckItOut_Helper_Data extends Aligent_CartCheckItOut_Helper_Base
{
    const XML_GOOGLE_MAPS_URL_PATH = 'aligent_cartcheckitout/settings/google_maps_api_url';
    const XML_ENABLED_PATH = 'aligent_cartcheckitout/settings/enabled';
    const XML_DEFAULT_PAYMENT_METHOD_PATH = 'aligent_cartcheckitout/settings/default_payment_method';
    const XML_EMARSYS_ENABLED_PATH = 'aligent_cartcheckitout/settings/emarsys_enabled';

    public function getDev(){
        // Returns a neat object .
        return (object)[
            'desc' => 'This is what a CartCheckItOut object looks like',
            'firstParam' => 'first parameter'
        ];
    }

    public function getCartItems() {
        // Returns an array of cartItem objects for rendering
        $cartItems = [];
        foreach ($this->_getQuote()->getAllVisibleItems() as $item) {
            $cartItems[] = $item;
        }

        return $cartItems;
    }

    public function getGoogleMapsUrl() {
        return Mage::getStoreConfig($this::XML_GOOGLE_MAPS_URL_PATH);
    }

    public function isEnabled() {
        return Mage::getStoreConfigFlag($this::XML_ENABLED_PATH);
    }

    public function getDefaultPaymentMethod() {
        return Mage::getStoreConfig($this::XML_DEFAULT_PAYMENT_METHOD_PATH);
    }

    public function isEmarsysEnabled() {
        return Mage::getStoreConfigFlag($this::XML_EMARSYS_ENABLED_PATH);
    }
}
