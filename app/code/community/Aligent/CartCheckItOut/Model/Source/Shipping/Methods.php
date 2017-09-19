<?php
/**
 * Shipping method source model for default shipping method select
 */
class Aligent_CartCheckItOut_Model_Source_Shipping_Methods extends Mage_Adminhtml_Model_System_Config_Source_Shipping_Allmethods
{
    /**
     * Return array of carriers.
     * If $isActiveOnlyFlag is ignored
     *
     * @param bool $isActiveOnlyFlag
     * @return array
     */
    public function toOptionArray($isActiveOnlyFlag=false) {
        return parent::toOptionArray(true);
    }
}