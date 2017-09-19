<?php

class Aligent_CartCheckItOut_Block_Billingcountry extends Aligent_CartCheckItOut_Block_Country {

    public function getSelectedCountry() {
        return $this->getCustomerHelper()->getBillingCountry();
    }

    public function sameAsShipping() {
        return $this->getQuoteHelper()->isSameAsBilling();
    }
}