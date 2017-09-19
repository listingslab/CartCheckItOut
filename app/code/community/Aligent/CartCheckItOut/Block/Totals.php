<?php

class Aligent_CartCheckItOut_Block_Totals extends Aligent_CartCheckItOut_Block_Base {



    public function getTotals() {
        return $this->getTotalsHelper()->getQuoteTotals();
    }

    public function getCurrencySymbol() {
        return Mage::app()->getStore()->getCurrentCurrencyCode();
    }

    public function isFreeShipping() {
        return $this->getTotalsHelper()->hasFreeShipping();
    }

    public function amountTillFreeShipping() {
        return $this->getTotalsHelper()->getDollarsToFreeShip();
    }

    public function isFreeShippingAvailable() {
        return $this->getTotalsHelper()->isFreeShippingPossible();
    }
}