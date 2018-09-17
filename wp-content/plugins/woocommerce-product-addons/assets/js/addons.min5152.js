jQuery(document).ready(function(a){a.fn.init_addon_totals=function(){function b(){var b=a(".product-type-grouped"),c=0,d=0;return b.length&&(b.find(".group_table tr.product").each(function(){0<a(this).find(".input-text.qty").val()&&(a(this).find(".entry-summary .subscription-details").length?c++:d++)}),c>0&&d>0)?!0:!1}function c(){var b=a(".product-type-grouped"),c=!1;return b.length&&b.find(".group_table tr.product").each(function(){return 0<a(this).find(".input-text.qty").val()&&a(this).find(".entry-summary .subscription-details").length?(c=!0,!1):void 0}),c}var d=a(this),e=d.hasClass("variations_form")?d.find('input[name="variation_id"], input.variation_id'):!1;a(this).on("click",".reset_variations",function(){a.each(d.find(".product-addon"),function(){var b=a(this).find(".addon");(b.is(":checkbox")||b.is(":radio"))&&b.prop("checked",!1),b.is("select")&&b.prop("selectedIndex",0),(b.is(":text")||b.is("textarea")||b.is('input[type="number"]')||b.is('input[type="file"]'))&&b.val("")}),d.trigger("woocommerce-product-addons-update")}),a(this).on("mouseup","input[type=number]",function(b){a(this).trigger("woocommerce-product-addons-update")}),a(this).on("keyup change",".product-addon input, .product-addon textarea",function(){if(a(this).attr("maxlength")>0){var b=a(this).val(),c=a(this).attr("maxlength")-b.length;a(this).next(".chars_remaining").find("span").text(c)}}),a(this).find(" .addon-custom, .addon-custom-textarea").each(function(){a(this).attr("maxlength")>0&&a(this).after('<small class="chars_remaining"><span>'+a(this).attr("maxlength")+"</span> "+woocommerce_addons_params.i18n_remaining+"</small>")}),a(this).on("change",".product-addon input, .product-addon textarea, .product-addon select, input.qty",function(){a(this).trigger("woocommerce-product-addons-update")}),a(this).on("found_variation",function(b,c){var d=a(this),e=d.find("#product-addons-total");"undefined"!=typeof c.display_price?e.data("price",c.display_price):a(c.price_html).find(".amount:last").size()&&(product_price=a(c.price_html).find(".amount:last").text(),product_price=product_price.replace(woocommerce_addons_params.currency_format_symbol,""),product_price=product_price.replace(woocommerce_addons_params.currency_format_thousand_sep,""),product_price=product_price.replace(woocommerce_addons_params.currency_format_decimal_sep,"."),product_price=product_price.replace(/[^0-9\.]/g,""),product_price=parseFloat(product_price),e.data("price",product_price)),d.trigger("woocommerce-product-addons-update")});var f=a("#credit_called");a(f).on("keyup",function(){d.trigger("woocommerce-product-addons-update")}),a(this).on("woocommerce-product-addons-update",function(){var g=0,h=0,i=d.find("#product-addons-total"),j=e&&e.length>0,k=j?e.val():i.data("product-id"),l=i.data("price"),m=i.data("type"),n=d.find(".quantity .qty").val();if(""===l&&f.length&&0<f.val()&&(l=f.val()),d.find(".addon").each(function(){var b=0,c=0;a(this).is(".addon-custom-price")?b=a(this).val():a(this).is(".addon-input_multiplier")?(isNaN(a(this).val())||""==a(this).val()?(a(this).val(""),a(this).closest("p").find(".addon-alert").show()):(""!=a(this).val()&&a(this).val(Math.ceil(a(this).val())),a(this).closest("p").find(".addon-alert").hide()),b=a(this).data("price")*a(this).val(),c=a(this).data("raw-price")*a(this).val()):a(this).is(".addon-checkbox, .addon-radio")?a(this).is(":checked")&&(b=a(this).data("price"),c=a(this).data("raw-price")):a(this).is(".addon-select")?a(this).val()&&(b=a(this).find("option:selected").data("price"),c=a(this).find("option:selected").data("raw-price")):a(this).val()&&(b=a(this).data("price"),c=a(this).data("raw-price")),b||(b=0),c||(c=0),g=parseFloat(g)+parseFloat(b),h=parseFloat(h)+parseFloat(c)}),i.data("addons-price",g),i.data("addons-raw-price",h),d.find("input.qty").size()){var n=0;d.find("input.qty").each(function(){n+=parseFloat(a(this).val())})}else var n=1;if(g&&n){var o,p=!1;g=parseFloat(g*n),h=parseFloat(h*n);var q=accounting.formatMoney(g,{symbol:woocommerce_addons_params.currency_format_symbol,decimal:woocommerce_addons_params.currency_format_decimal_sep,thousand:woocommerce_addons_params.currency_format_thousand_sep,precision:woocommerce_addons_params.trim_trailing_zeros?0:woocommerce_addons_params.currency_format_num_decimals,format:woocommerce_addons_params.currency_format});if("undefined"!=typeof l&&k){o=parseFloat(l*n);var r=accounting.formatMoney(o+g,{symbol:woocommerce_addons_params.currency_format_symbol,decimal:woocommerce_addons_params.currency_format_decimal_sep,thousand:woocommerce_addons_params.currency_format_thousand_sep,precision:woocommerce_addons_params.trim_trailing_zeros?0:woocommerce_addons_params.currency_format_num_decimals,format:woocommerce_addons_params.currency_format})}a(this).parent().find(".subscription-details").length&&(d.hasClass("bundle_data")||(p=a(this).parent().find(".subscription-details").clone().wrap("<p>").parent().html())),"grouped"===m?p&&!b()&&c()&&(q+=p,r&&(r+=p)):p&&(q+=p,r&&(r+=p));var s='<dl class="product-addon-totals"><dt>'+woocommerce_addons_params.i18n_addon_total+'</dt><dd><strong><span class="amount">'+q+"</span></strong></dd>";if(r&&"1"==i.data("show-sub-total")){var t="",u="undefined"==typeof i.data("i18n_sub_total")?woocommerce_addons_params.i18n_sub_total:i.data("i18n_sub_total");if(!woocommerce_addons_params.price_display_suffix)return s=s+"<dt>"+u+'</dt><dd><strong><span class="amount">'+r+"</span></strong></dd></dl>",i.html(s),void d.trigger("updated_addons");if(!1==woocommerce_addons_params.price_display_suffix.indexOf("{price_including_tax}")>-1&&!1==woocommerce_addons_params.price_display_suffix.indexOf("{price_excluding_tax}")>-1)return s=s+"<dt>"+u+'</dt><dd><strong><span class="amount">'+r+"</span> "+woocommerce_addons_params.price_display_suffix+"</strong></dd></dl>",i.html(s),void d.trigger("updated_addons");a.ajax({type:"POST",url:woocommerce_addons_params.ajax_url,data:{action:"wc_product_addons_calculate_tax",product_id:k,add_on_total:g,add_on_total_raw:h,qty:n},success:function(a){if("SUCCESS"==a.result){t='<small class="woocommerce-price-suffix">'+woocommerce_addons_params.price_display_suffix+"</small>";var b=accounting.formatMoney(a.price_including_tax,{symbol:woocommerce_addons_params.currency_format_symbol,decimal:woocommerce_addons_params.currency_format_decimal_sep,thousand:woocommerce_addons_params.currency_format_thousand_sep,precision:woocommerce_addons_params.currency_format_num_decimals,format:woocommerce_addons_params.currency_format}),c=accounting.formatMoney(a.price_excluding_tax,{symbol:woocommerce_addons_params.currency_format_symbol,decimal:woocommerce_addons_params.currency_format_decimal_sep,thousand:woocommerce_addons_params.currency_format_thousand_sep,precision:woocommerce_addons_params.currency_format_num_decimals,format:woocommerce_addons_params.currency_format});t=t.replace("{price_including_tax}",b),t=t.replace("{price_excluding_tax}",c),s=s+"<dt>"+u+'</dt><dd><strong><span class="amount">'+r+"</span> "+t+" </strong></dd></dl>",i.html(s),d.trigger("updated_addons")}else s=s+"<dt>"+u+'</dt><dd><strong><span class="amount">'+r+"</span></strong></dd></dl>",i.html(s),d.trigger("updated_addons")},error:function(){s=s+"<dt>"+u+'</dt><dd><strong><span class="amount">'+r+"</span></strong></dd></dl>",i.html(s),d.trigger("updated_addons")}})}else i.empty(),d.trigger("updated_addons")}else i.empty(),d.trigger("updated_addons")}),a(this).find(".addon-custom, .addon-custom-textarea, .product-addon input, .product-addon textarea, .product-addon select, input.qty").change(),a(this).find(".variations select").change()},a("body").on("quick-view-displayed",function(){a(this).find(".cart:not(.cart_group)").each(function(){a(this).init_addon_totals()})}),a("body .component").on("wc-composite-component-loaded",function(){a(this).find(".cart").each(function(){a(this).init_addon_totals()})}),a("body").find(".cart:not(.cart_group)").each(function(){a(this).init_addon_totals()})});