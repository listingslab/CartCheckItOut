<?php

class Aligent_CartCheckItOut_Block_Country extends Aligent_CartCheckItOut_Block_Base {

    public function getSelectedCountry() {}

    public function getCountryList() {
        return Mage::getModel('directory/country')->getResourceCollection()
            ->loadByStore()
            ->toOptionArray(true);
    }
}

