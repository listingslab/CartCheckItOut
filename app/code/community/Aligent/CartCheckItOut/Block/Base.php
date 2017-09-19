<?php

class Aligent_CartCheckItOut_Block_Base extends Mage_Core_Block_Template {

    protected $_totalsHelper = null;
    protected $_couponGiftcardHelper = null;
    protected $_customerHelper = null;
    protected $_helper = null;
    protected $_quoteHelper = null;

    protected function getTotalsHelper() {
        if ($this->_totalsHelper === null) {
            $this->_totalsHelper = Mage::helper('aligent_cartcheckitout/totals');
        }
        return $this->_totalsHelper;
    }
    protected function getCouponGiftcardHelper() {
        if ($this->_couponGiftcardHelper === null) {
            $this->_couponGiftcardHelper = Mage::helper('aligent_cartcheckitout/coupongiftcard');
        }
        return $this->_couponGiftcardHelper;
    }
    protected function getCustomerHelper() {
        if ($this->_customerHelper === null) {
            $this->_customerHelper = Mage::helper('aligent_cartcheckitout/customer');
        }
        return $this->_customerHelper;
    }
    protected function getDataHelper() {
        if ($this->_helper === null) {
            $this->_helper = Mage::helper('aligent_cartcheckitout');
        }
        return $this->_helper;
    }
    protected function getQuoteHelper() {
        if ($this->_quoteHelper === null) {
            $this->_quoteHelper = Mage::helper('aligent_cartcheckitout/quote');
        }
        return $this->_quoteHelper;
    }

    public function getDefaultStoreCountry() {
        return $this->getDataHelper()->getStoreDefaultCountry();
    }

}