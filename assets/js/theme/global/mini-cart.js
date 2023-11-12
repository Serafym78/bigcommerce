import utils from '@bigcommerce/stencil-utils';
import {showAlertModal} from './modal';

export default function () {
    const overlay = $('[data-mini-cart] .loadingOverlay');

    function refreshContent() {
        utils.api.cart.getCartQuantity({}, (err, response) => {
            const quantity = response;
            $('body').trigger('cart-quantity-update', quantity);

        });
    }

    function miniCartUpdate($target){
        const itemId = $target.dataset.cartItemid;
        const action = $target.dataset.action;

        const $el = $(`#qty-${itemId}`);
        const oldQty = parseInt($el.val(), 10);
        const maxQty = parseInt($el.data('quantityMax'), 10);
        const minQty = parseInt($el.data('quantityMin'), 10);
        const minError = $el.data('quantityMinError');
        const maxError = $el.data('quantityMaxError');
        const newQty = action === 'del' ? 0 : action === 'inc' ? oldQty + 1 : oldQty - 1;
        $el.val(newQty);
        // Does not quality for min/max quantity
        if (newQty < minQty) {
            return showAlertModal(minError);
        } else if (maxQty > 0 && newQty > maxQty) {
            return showAlertModal(maxError);
        }

        overlay.show();

        utils.api.cart.itemUpdate(itemId, newQty, (err, response) => {
            if (response.data.status === 'succeed') {
                const remove = (newQty === 0);
                if (remove) {
                    $target.closest('li').remove();
                }
                refreshContent();
            } else {
                $el.val(oldQty);
                showAlertModal(response.data.errors.join('\n'));
            }
            if (window.location.href.indexOf('cart.php')>-1) {
                return window.location.reload();
            }
            overlay.hide();
        });
    }

    $('.cart-item-quantity .form-increment.minicart button').on('click', (e) => {
        e.stopPropagation();
        miniCartUpdate(e.currentTarget);
    });
}
