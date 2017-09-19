<?php

class Aligent_CartCheckItOut_Model_Checkout_Type_Onepage extends Mage_Checkout_Model_Type_Onepage {

    public function initCheckout()
    {
        // Get a copy of the current addresses to restore once the checkout is initialised
        $billingAddress = clone $this->getQuote()->getBillingAddress();
        $billingAddress->unsetData('address_id');
        $shippingAddress = clone $this->getQuote()->getShippingAddress();
        $shippingAddress->unsetData('address_id');

        parent::initCheckout();

        /*
         * If the customer is logged in and has been returned to the payment step,
         * restore the address data from the quote as the parent initCheckout method will
         * have replaced them with the customer's default addresses.
         */
        if (Mage::helper('aligent_cartcheckitout/customer')->isLoggedIn()) {
            $this->getQuote()->setBillingAddress($billingAddress);
            $this->getQuote()->setShippingAddress($shippingAddress);
        }

        // Make sure we have the correct shipping method set
        if ($this->getQuote()->hasItems()) {
            Mage::helper('aligent_cartcheckitout/quote')->setDefaultCountry();
            Mage::helper('aligent_cartcheckitout/quote')->applyDefaultShippingToQuote(true);
        }

        return $this;
    }
}
