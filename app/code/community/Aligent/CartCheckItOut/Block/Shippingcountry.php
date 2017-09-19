<?php

class Aligent_CartCheckItOut_Block_Shippingcountry extends Aligent_CartCheckItOut_Block_Country {

    public function getSelectedCountry() {
        return $this->getCustomerHelper()->getShippingCountry();
    }

    public function canShowATL() {
        return $this->getTotalsHelper()->isFreeShippingPossible();
    }

    public function isATLChecked() {
        return Mage::helper('aligent_cartcheckitout/quote')->getATL();
    }

    public function getATLInstructions() {
        return Mage::helper('aligent_cartcheckitout/quote')->getATLInstructions();
    }
}