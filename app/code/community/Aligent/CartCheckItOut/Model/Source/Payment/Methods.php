<?php
class Aligent_CartCheckItOut_Model_Source_Payment_Methods
{
    /**
     * Return array of active checkout payment methods.
     *
     * @return array
     */
    public function toOptionArray() {

        foreach (Mage::helper('payment')->getStoreMethods() as $paymentCode => $paymentModel) {
            if($paymentModel->canUseCheckout()) {
                $paymentTitle = Mage::getStoreConfig('payment/'.$paymentModel->getCode().'/title');
                $methods[$paymentModel->getCode()] = array(
                    'label'   => $paymentTitle,
                    'value' => $paymentModel->getCode(),
                );
            }
        }

        return $methods;
    }
}