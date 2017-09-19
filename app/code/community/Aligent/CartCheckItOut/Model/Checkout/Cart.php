<?php

class Aligent_CartCheckItOut_Model_Checkout_Cart extends Mage_Checkout_Model_Cart
{

    /**
     * Initialize cart quote state to be able use it on cart page
     *
     * @return Mage_Checkout_Model_Cart
     */
    public function init()
    {
        parent::init();

        if ($this->getQuote()->hasItems()) {
            Mage::helper('aligent_cartcheckitout/quote')->setDefaultCountry();
            Mage::helper('aligent_cartcheckitout/quote')->applyDefaultShippingToQuote(true);
        }

        return $this;
    }
}
