/* packer link http://dean.edwards.name/packer/ */
(function ($){
    $(document).ready(function (){

        var berocket_aapf_widget_product_filters = [],
            berocket_aapf_widget_product_limits = [],
            berocket_aapf_widget_product_price_limit = [],
            woocommerce_pagination_page = 1,
            berocket_aapf_widget_wait_for_button = false,
            berocket_aapf_widget_selected_filters = [],
            berocket_aapf_widget_first_page_jump = true,
            berocket_aapf_widget_scroll_shop_top = the_ajax_script.scroll_shop_top,
            berocket_last_ajax_request = null,
            berocket_last_ajax_request_id = 1;

        if( $(the_ajax_script.pagination_class).hasClass(the_ajax_script.pagination_class) ){
            woocommerce_pagination_page = parseInt( $(the_ajax_script.pagination_class+' .current').first().text() );
            if( woocommerce_pagination_page < 1 ) woocommerce_pagination_page = 1;
        }

        if( $('.berocket_aapf_widget_update_button').hasClass('berocket_aapf_widget_update_button') ){
            berocket_aapf_widget_wait_for_button = true;
        }

        function berocket_fire( func ){
            if ( typeof the_ajax_script.user_func != 'undefined'
                && the_ajax_script.user_func != null
                && typeof func != 'undefined'
                && func.length > 0
            ) {
                try{
                    eval( func );
                } catch(err){
                    alert('You have some incorrect JavaScript code (AJAX Products Filter)');
                }
            }
        }

        function update_selected_area() {
            if ( ! $('.berocket_aapf_widget_selected_area').hasClass('berocket_aapf_widget_selected_area') ) {
                return false;
            }
            tmp_html = '';
            prev_label = '';
            el_type = '';
            $(berocket_aapf_widget_selected_filters).each(function (i, $el) {
                if ( $el.is('select') ) {
                    label = $el.data('taxonomy').slice(3).charAt(0).toUpperCase() + $el.data('taxonomy').slice(4);
                    option = $el.find('option:selected').text();
                    el_type = 'select';
                    el_id = $el.attr('id');
                } else if ( $el.is('input') ) {
                    label = $el.data('taxonomy').slice(3).charAt(0).toUpperCase() + $el.data('taxonomy').slice(4);
                    option = $el.closest('li').find('label').text();
                    el_type = $el.attr('type');
                    el_id = $el.attr('id');
                } else if ( $el.hasClass('berocket_filter_slider') ) {
                    val1 = $('#'+$el.data('fields_1')).val();
                    val2 = $('#'+$el.data('fields_2')).val();
                    if ( val1 != $el.data('min') || val2 != $el.data('max') ) {
                        if ( $el.hasClass('berocket_filter_price_slider') ) {
                            label = 'Price';
                        } else {
                            label = $el.data('taxonomy').slice(3).charAt(0).toUpperCase() + $el.data('taxonomy').slice(4);
                        }
                    }
                    el_type = 'slider';
                    el_id = $el.data('fields_2');
                    option = val1+' - '+val2;
                }

                option = '<li><a href="Unselect '+label+'" data-el_type="'+el_type+'" data-el_id="'+el_id+'">'+option+'</a></li>';

                if ( prev_label == '' ) {
                    tmp_html += '<div><span>'+label+'</span><ul>'+option;
                } else if ( prev_label == label ) {
                    tmp_html += option;
                } else {
                    tmp_html += '</ul></div><div><span>'+label+'</span><ul>'+option;
                }

                prev_label = label;
            });

            if ( tmp_html == '' ) {
                $('.berocket_aapf_widget_selected_area').html('').hide().prev().hide();
            } else {
                tmp_html += '</ul></div>';
                $('.berocket_aapf_widget_selected_area').html(tmp_html).show().prev().show();
            }
        }

        function update_data_containers() {
            berocket_aapf_widget_product_filters = [];
            berocket_aapf_widget_selected_filters = [];
            $('.berocket_aapf_widget li:not(.slider) input, .berocket_aapf_widget li:not(slider) select').each(function (i,o) {
                $el = $(o);

                if ( $el.is("select") ) {
                    el_data = [];
                    $el.find("option:selected").each(function(i, o) {
                        if( $(o).val() ) {
                            el_data.push($(o).data());
                        }
                    });

                    var el_show = true;
                    $(berocket_aapf_widget_product_filters).each(function (i, o) {
                        el_data.forEach(function(element) {
                            if (o[0] == element.taxonomy) {
                                el_show = false;
                            }
                        });
                    });
                    if( el_show && $el.val() ){
                        el_data.forEach(function(element) {
                            berocket_aapf_widget_product_filters[berocket_aapf_widget_product_filters.length] = [element.taxonomy, element.term_id, element.operator];
                            berocket_aapf_widget_selected_filters[berocket_aapf_widget_selected_filters.length] = $el;
                        });
                    }
                } else {
                    el_data = $el.data();
                    
                    var el_show = true;
                    $(berocket_aapf_widget_product_filters).each(function (i, o) {
                        if (o[0] == el_data.taxonomy && o[1] == el_data.term_id) {
                            el_show = false;
                        }
                    });
                    
                    if (el_show && ($el.is(':checked') || $el.is(':selected'))) {
                        berocket_aapf_widget_product_filters[berocket_aapf_widget_product_filters.length] = [el_data.taxonomy, el_data.term_id, el_data.operator];
                        berocket_aapf_widget_selected_filters[berocket_aapf_widget_selected_filters.length] = $el;
                    }
                }
            });

            berocket_aapf_widget_product_limits = [];
            berocket_aapf_widget_product_price_limit = [];
            $t = $('.berocket_filter_slider');
            if( $t.hasClass('berocket_filter_slider') ){
                $t.each(function (i,o){
                    val1 = $('#'+$(o).data('fields_1')).val();
                    val2 = $('#'+$(o).data('fields_2')).val();
                    if( val1 != $(o).data('min') || val2 != $(o).data('max') ){
                        berocket_aapf_widget_selected_filters[berocket_aapf_widget_selected_filters.length] = $(o);
                        if( $(o).hasClass('berocket_filter_price_slider') ){
                            berocket_aapf_widget_product_price_limit = [val1, val2];
                        } else {
                            var add_limit = true;
                            for( i = 0 ; i < berocket_aapf_widget_product_limits.length ; i++ ) {
                                if( berocket_aapf_widget_product_limits[ i ][ 0 ] == $(o).data( 'taxonomy' ) ) {
                                    add_limit = false;
                                }
                            }
                            if( add_limit ) {
                                berocket_aapf_widget_product_limits[berocket_aapf_widget_product_limits.length] = [$(o).data('taxonomy'), val1, val2];
                            }
                        }
                    }
                });
            }
        }

        function updateProducts ( $force ){
            if ( typeof $force == 'undefined' ) $force = false;
            // if we have update_button on the page we must wait for it to be clicked
            if ( ! $force && berocket_aapf_widget_wait_for_button ) return false;
            $(document).trigger('berocket_ajax_filtering_start');

            // call user func before_update
            if( the_ajax_script.user_func != null )
                berocket_fire( the_ajax_script.user_func.before_update );

            
            if ( berocket_last_ajax_request == null ) {
                $(the_ajax_script.products_holder_id).addClass('hide_products').append('<div class="berocket_aapf_widget_loading" />');
            } else {
                berocket_last_ajax_request.abort();
                berocket_last_ajax_request = null;
            }

            update_data_containers();
            update_selected_area();

            var orderby = the_ajax_script.default_sorting;
            if ( $(the_ajax_script.ordering_class+' select.orderby').length > 0 ) {
                orderby = $(the_ajax_script.ordering_class+' select.orderby').val();
            }

            args = {
                current_language: the_ajax_script.current_language,
                terms: berocket_aapf_widget_product_filters,
                price: berocket_aapf_widget_product_price_limit,
                limits: berocket_aapf_widget_product_limits,
                product_cat: the_ajax_script.product_cat,
                product_taxonomy: the_ajax_script.product_taxonomy,
                action: 'berocket_aapf_listener',
                orderby: orderby,
                s: the_ajax_script.s
            };

            if( the_ajax_script.seo_friendly_urls && 'history' in window && 'pushState' in history ) {
                updateLocation( args, true );
                args.location = location.href;
            }else{
                args.location = the_ajax_script.current_page_url;

                cur_page = $(the_ajax_script.pagination_class+' .current').first().text();
                if( prev_page = location.href.replace(/.+\/page\/([0-9]+).+/, "$1") ){
                    if( ! parseInt( cur_page ) ){
                        cur_page = prev_page;
                    }
                    if(berocket_aapf_widget_first_page_jump && the_ajax_script.first_page) {
                        cur_page = 1;
                    }
                    args.location = args.location.replace(/\/?/,"") + "/page/" + cur_page + "/";
                }else if( prev_page = location.href.replace(/.+paged?=([0-9]+).+/, "$1") ){
                    if( ! parseInt( cur_page ) ){
                        cur_page = prev_page;
                    }
                    if(berocket_aapf_widget_first_page_jump && the_ajax_script.first_page)   {
                        cur_page = 1;
                    }
                    args.location = args.location.replace(/\/?/,"") + "/?page=" + cur_page + "";
                }
                if( the_ajax_script.seo_friendly_urls ) {
                    uri_request = updateLocation(args, false);
                    location.hash = '';
                    if( parseInt( cur_page ) )
                        location.hash = "paged="+parseInt( cur_page )+"&";
                    if( uri_request != "")
                        uri_request = 'filters=' + uri_request;
                    location.hash += 'filters=('+uri_request+')';
                }
            }

            if( berocket_aapf_widget_scroll_shop_top ) {
                var top_scroll_offset = 0;
                if( $( the_ajax_script.products_holder_id ).length ) {
                    top_scroll_offset = $( the_ajax_script.products_holder_id ).offset().top - 180;
                    if(top_scroll_offset < 0) top_scroll_offset = 0;
                }
                $("html, body").animate({ scrollTop: top_scroll_offset }, "slow");
            }
            args.location = updateLocation(args, true, true);
            if(the_ajax_script.ajax_request_load) {
                if( the_ajax_script.ajax_request_load_style == 'jquery' ) {
                    url = args.location;
                    return_type = 'html';
                    new_args = {};
                } else {
                    return_type = 'json';
                    if( args.location.indexOf('?') > 0 ) {
                        url = args.location+'&explode=explode';
                    } else {
                        url = args.location+'/?explode=explode';
                    }
                    new_args = {
                        location: args.location
                    };
                }
            } else {
                return_type = 'json';
                url = the_ajax_script.ajaxurl;
                new_args = args;
            }
            var send_type = the_ajax_script.use_request_method;
            var berocket_this_ajax_request = berocket_last_ajax_request = $[send_type](url, new_args, function (data) {
                berocket_last_ajax_request = null;
                berocket_last_ajax_request_id = 1;
                if(! the_ajax_script.ajax_request_load || the_ajax_script.ajax_request_load_style != 'jquery' ) {
                    $(the_ajax_script.result_count_class).remove();
                    $(the_ajax_script.pagination_class).remove();
                    $(the_ajax_script.ordering_class).remove();
                    $('#content .berocket_lgv_widget').remove();
                    $('#content .br_lgv_product_count_block').remove();
                }

                // call user func on_update
                if( the_ajax_script.user_func != null )
                    berocket_fire( the_ajax_script.user_func.on_update );

                if(! the_ajax_script.ajax_request_load || the_ajax_script.ajax_request_load_style != 'jquery' ) {
                    if ( $('.woocommerce-info').hasClass('woocommerce-info') && ! $(the_ajax_script.products_holder_id).is(':visible') ) {
                        if ( typeof data.products != 'undefined' ) {
                            $('.woocommerce-info').replaceWith(data.products);
                        }
                    } else {
                        if ( typeof data.no_products != 'undefined' ) {
                            $(the_ajax_script.products_holder_id).html(data.no_products).removeClass('hide_products');
                        } else {
                            $(the_ajax_script.products_holder_id).replaceWith(data.products).removeClass('hide_products');
                        }
                    }
                } else {
                    var $products_holder_id = $(the_ajax_script.products_holder_id)
                    if( $(the_ajax_script.products_holder_id).length == 0 && $('.woocommerce-info').length > 0 ) {
                        $products_holder_id = $('.woocommerce-info');
                    }
                    if( $(data).find(the_ajax_script.result_count_class).length == 0 ) {
                        $(the_ajax_script.result_count_class).html('');
                    } else {
                        if( $(the_ajax_script.result_count_class).length > 0 ) {
                            $(the_ajax_script.result_count_class).replaceWith($(data).find(the_ajax_script.result_count_class).first());
                        } else {
                            $products_holder_id.before($(data).find(the_ajax_script.result_count_class).first());
                        }
                    }
                    if( $(data).find(the_ajax_script.ordering_class).length == 0 ) {
                        $(the_ajax_script.ordering_class).html('');
                    } else {
                        if( $(the_ajax_script.ordering_class).length > 0 ) {
                            $(the_ajax_script.ordering_class).replaceWith($(data).find(the_ajax_script.ordering_class).first());
                        } else {
                            $products_holder_id.before($(data).find(the_ajax_script.ordering_class).first());
                        }
                    }
                    if( $(data).find(the_ajax_script.pagination_class).length == 0 ) {
                        $(the_ajax_script.pagination_class).html('');
                    } else {
                        if( $(the_ajax_script.pagination_class).length > 0 ) {
                            $(the_ajax_script.pagination_class).replaceWith($(data).find(the_ajax_script.pagination_class).first());
                        } else {
                            $products_holder_id.after($(data).find(the_ajax_script.pagination_class).first());
                        }
                    }
                    if( $(data).find(the_ajax_script.products_holder_id).length == 0 ) {
                        if( $(data).find('.woocommerce-info').length == 0 ) {
                            $products_holder_id.html('<div class="no-products '+the_ajax_script.no_products_class+'">'+the_ajax_script.no_products_message+'</div>');
                        } else {
                            if( the_ajax_script.no_products_message.length > 0 ) {
                                $products_holder_id.html('<div class="no-products '+the_ajax_script.no_products_class+'">'+the_ajax_script.no_products_message+'</div>');
                            } else {
                                $products_holder_id.html($(data).find('.woocommerce-info').first());
                            }
                        }
                    } else {
                        $products_holder_id.replaceWith($(data).find(the_ajax_script.products_holder_id).first());
                    }
                }

                $('.berocket_aapf_widget_loading').remove();

                berocket_aapf_widget_first_page_jump = true;
                aapf_action_init();

                // call user func after_update
                $(document).trigger('berocket_ajax_products_loaded');
                $(document).trigger('berocket_ajax_filtering_end');
                if( the_ajax_script.user_func != null )
                    berocket_fire( the_ajax_script.user_func.after_update );
            }, return_type).fail(function() {
                $(document).trigger('berocket_ajax_filtering_end');
            });
        }

        function updateLocation( args, pushstate, return_request ){
            if(typeof return_request == 'undefined') return_request = false;
            uri_request_array = [];
            uri_request = '';
            temp_terms = [];

            if( args.orderby && the_ajax_script.default_sorting != args.orderby ){
                uri_request += 'order-'+args.orderby;
            }
            if( args.product_cat && args.product_cat > 0 ){
                if( uri_request ) uri_request += "|";
                uri_request += 'pcategory-'+args.product_cat;
            }
            if( args.price ){
                $price_obj = $('.berocket_filter_price_slider');
                if( args.price[0] && args.price[1] && ( args.price[0] != $price_obj.data('min') || args.price[1] != $price_obj.data('max') ) ){
                    if( uri_request ) uri_request += "|";
                    uri_request += 'price['+args.price[0]+'_'+args.price[1]+']';
                }
            }

            if( args.limits ){
                $(args.limits).each(function (i,o){
                    if( o[0].substring(0, 3) == 'pa_' ) {
                        var attribute = o[0].substring(3);
                    } else {
                        var attribute = o[0];
                    }
                    if( !in_array( attribute, temp_terms ) ){
                        temp_terms[temp_terms.length] = attribute;
                    }
                    if( typeof uri_request_array[in_array( attribute, temp_terms )] == 'undefined' ) {
                        uri_request_array[in_array(attribute, temp_terms)] = [];
                    }

                    uri_request_array[in_array( attribute, temp_terms )]
                        [uri_request_array[in_array( attribute, temp_terms )].length] = [o[1],o[2]];
                });
            }
            if( args.terms ){
                $(args.terms).each(function (i,o){
                    if( o[0].substring(0, 3) == 'pa_' ) {
                        var attribute = o[0].substring(3);
                    } else {
                        var attribute = o[0];
                    }
                    if( !in_array( attribute, temp_terms ) ){
                        temp_terms[temp_terms.length] = attribute;
                    }
                    if( typeof uri_request_array[in_array( attribute, temp_terms )] == 'undefined' ) {
                        uri_request_array[in_array(attribute, temp_terms)] = [];
                    }

                    uri_request_array[in_array( attribute, temp_terms )]
                        [uri_request_array[in_array( attribute, temp_terms )].length] = [o[1],o[2]];
                });
            }

            var uri = the_ajax_script.current_page_url;

            if( uri_request_array.length ){
                $(uri_request_array).each(function (i,o){
                    if( uri_request ) uri_request += "|";

                    if( typeof o != 'object' ){
                        uri_request += o;
                    }else{
                        cnt_oo = false;
                        uri_request += temp_terms[i]+'[';

                        $(o).each(function (ii,oo){
                            if( ( oo[1] == 'AND' || oo[1] == 'OR' ) ){
                                if( cnt_oo ){
                                    if(oo[1] == 'AND'){
                                        uri_request += '+';
                                    }else{
                                        uri_request += '-';
                                    }
                                }
                            }else{
                                oo[0] += '_'+oo[1];
                            }
                            uri_request += oo[0];
                            cnt_oo = true;
                        });
                        uri_request += ']'
                    }
                });
            }

            if( !pushstate ) {
                return uri_request;
            }

            cur_page = $(the_ajax_script.pagination_class+' .current').first().text();
            if( prev_page = parseInt( location.href.replace(/.+\/page\/([0-9]+).+/, "$1") ) ){
                if( ! parseInt( cur_page ) ){
                    cur_page = prev_page;
                }
                if(berocket_aapf_widget_first_page_jump && the_ajax_script.first_page)   {
                    cur_page = 1;
                }
                uri = uri.replace(/\/?$/,"") + "/page/" + cur_page + "/";
                if( uri_request ){
                    uri = uri + "?filters=" + uri_request;
                }
            }else{
                something_added = false;
                if( /\?/.test(location.href) ){
                    passed_vars1 = location.href.split('?');
                    if( passed_vars1[1] ){
                        passed_vars2 = [];
                        temp2 = [];
                        if( /&/.test(passed_vars1[1]) ) {
                            passed_vars2 = passed_vars1[1].split('&');
                            passed_vars2_length = passed_vars2.length;
                            for ( k = 0; k < passed_vars2_length; k++ ){
                                temp = passed_vars2[k].split('=');
                                passed_vars2[k] = [];
                                passed_vars2[k][0] = temp.shift();
                                passed_vars2[k][1] = temp.join("=");
                            }
                        }else{
                            passed_vars2[0] = [];
                            temp = passed_vars1[1].split('=');
                            passed_vars2[0][0] = temp.shift();
                            passed_vars2[0][1] = temp.join("=");
                        }
                        for ( k = 0; k < passed_vars2.length; k++ ){
                            if( passed_vars2[k][0] == 'filters' || passed_vars2[k][0] == 'page'  || passed_vars2[k][0] == 'paged' ) continue;

                            if( something_added ) uri += '&';
                            else                  uri += '/?';

                            uri += passed_vars2[k][0]+'='+passed_vars2[k][1];
                            something_added = true;
                        }
                    }
                }
                if(berocket_aapf_widget_first_page_jump && the_ajax_script.first_page) {
                    cur_page = 1;
                }
                if( something_added && uri_request ){
                    uri = uri + "&filters=" + uri_request;
                    if( cur_page > 1 ){
                        uri = uri + "&paged=" + parseInt( cur_page );
                    }
                }else if( uri_request ){
                    uri = uri + "/?filters=" + uri_request;
                    if( cur_page > 1 ){
                        uri = uri + "&paged=" + parseInt( cur_page );
                    }
                }else if( something_added && cur_page > 1 ){
                    uri = uri + "&paged=" + parseInt( cur_page );
                }else if( cur_page > 1 ){
                    uri = uri + "/?paged=" + parseInt( cur_page );
                }
            }

            if( return_request ) {
                return uri;
            } else {
                var stateParameters = { BeRocket: "Rules" };
                history.replaceState(stateParameters, "BeRocket Rules");
                history.pushState(stateParameters, "BeRocket Rules", uri);
                history.pathname = uri;
            }
        }

        function aapf_action_init(){
            if( the_ajax_script.use_select2 && $(".berocket_aapf_widget select").length && typeof $(".berocket_aapf_widget select").select2 == 'function' ) {
                $(".berocket_aapf_widget select").select2({width:'100%'});
            }
            // Take control over (default) pagination and sorting, make it AJAXy and work with filters
            $(the_ajax_script.pagination_class).on('click', 'a', function (event) {
                event.preventDefault();
                if ( $(this).hasClass('next') ) {
                    _next_page = parseInt( $(the_ajax_script.pagination_class+' .current').first().text() ) + 1;
                } else if ( $(this).hasClass('prev') ) {
                    _next_page = parseInt( $(the_ajax_script.pagination_class+' .current').first().text() ) - 1;
                } else {
                    _next_page = $(this).text();
                }
                $(the_ajax_script.pagination_class+' .current').removeClass('current');
                $(this).after("<span class='page-numbers current' style='display:none!important;'>"+_next_page+"</span>");
                berocket_aapf_widget_first_page_jump = false;
                updateProducts(true);
            });
        }

        function in_array(needle, haystack, strict) {
            var found = false, key, strict = !!strict;
            for (key in haystack) {
                if ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle)) {
                    found = key;
                    break;
                }
            }
            return found;
        }

        $('.berocket_aapf_widget').on("change", "input, select", function(){
            if( $(this).is('.select2-hidden-accessible') ) {
                $(this).addClass('select2changed');
                return 0;
            }
            berocket_on_change_inputs_selects($(this));
        });

        $('.berocket_aapf_widget').on("select2:close", "select", function(){
            if( $(this).is('.select2changed') ) {
                $(this).removeClass('select2changed');
                berocket_on_change_inputs_selects($(this));
            }
        });

        function berocket_on_change_inputs_selects(element) {
            if($(element).attr('type') == 'checkbox' || $(element).attr('type') == 'radio')
            {
                $label = $(element).parents('li').first().find('.berocket_label_widgets');
                if( $label.parents('li').first().find('input').prop('checked')) {
                    $('.'+$label.attr('for')).each(function( i2, o2 ) {
                        $(o2).prop('checked', false);
                        $(o2).parents('li').first().removeClass('berocket_hide_sel_value');
                    });
                    $('.'+$label.attr('for')).each(function( i2, o2 ) {
                        $(o2).parents('li').first().find('label').removeClass('berocket_checked');
                    });
                } else {
                    $('.'+$label.attr('for')).prop('checked', true);
                    if( $label.parents('li').first().find('input').attr('type') == 'radio' ) {
                        $('.'+$label.attr('for')).parents('.berocket_aapf_widget').find('li').removeClass('berocket_hide_sel_value');
                    }
                    if( the_ajax_script.hide_sel_value ) {
                        $('.'+$label.attr('for')).each(function( i2, o2 ) {
                            $(o2).parents('li').first().addClass('berocket_hide_sel_value');
                        });
                    }
                    $('.'+$label.attr('for')).each(function( i2, o2 ) {
                        $(o2).parents('li').first().find('label').addClass('berocket_checked');
                    });
                    //$label.addClass('berocket_checked');
                }
                $('.'+$label.attr('for')).parents('ul').find('input').trigger('refresh');
                if( the_ajax_script.hide_sel_value ) {
                    $hiden_objects = $(element).parents('.berocket_aapf_widget').find('.berocket_hide_o_value, .berocket_hide_sel_value');
                    if( $hiden_objects.length == 0 ) {
                        $(element).parents('.berocket_aapf_widget').find('.berocket_widget_show_values').hide();
                    } else {
                        $(element).parents('.berocket_aapf_widget').find('.berocket_widget_show_values').show();
                    }
                }
                
                if($(element).prop('checked'))
                {
                    $('.'+$label.attr('for')).prop('checked', true).trigger('refresh');
                    if( the_ajax_script.hide_sel_value ) {
                        $('.'+$label.attr('for')).each(function( i2, o2 ) {
                            $(o2).parents('li').first().addClass('berocket_hide_sel_value');
                        });
                    }
                }
                else
                {
                    $('.'+$label.attr('for')).prop('checked', false).trigger('refresh').each(function( i2, o2 ) {
                        $(o2).parents('li').first().removeClass('berocket_hide_sel_value');
                    });
                }
            } else if($(element).is('select')) {
                var selected_val = [];
                $(element).find('option:selected').each(function(i, o) {
                    selected_val.push($(o).val());
                });
                var first = true;
                $('select.'+$(element).data('taxonomy')).val(selected_val).trigger('refresh');
            }
            updateProducts();
        }

        $( ".berocket_filter_slider" ).each(function (i,o){
            $(o).slider({
                range: true,
                min: parseFloat($(o).data('min')),
                max: parseFloat($(o).data('max')),
                values: [$(o).data('value1'),$(o).data('value2')],
                slide: function( event, ui ) {
                    $o = $(ui.handle).parents('div.berocket_filter_slider');
                    vals = ui.values;
                    if( $(o).hasClass('berocket_filter_price_slider') ){
                        vals[0] = vals[0].toFixed(2);
                        vals[1] = vals[1].toFixed(2);
                    }
                    $( '#'+$o.data('fields_1') ).val( vals[0] );
                    $( '#'+$o.data('fields_2') ).val( vals[1] );

                    $('.slide div').each(function(i, obj)
                    {
                        if($(obj).data('taxonomy') == $(o).data('taxonomy'))
                        {
                            $(obj).slider("values", vals);
                            $( '#'+$(obj).data('fields_1') ).val( vals[0] );
                            $( '#'+$(obj).data('fields_2') ).val( vals[1] );
                        }
                    });
                },
                stop: function( ){
                    updateProducts();
                }
            });
        });

        $(".berocket_aapf_widget_height_control").each(function (i,o){
            $(o).mCustomScrollbar({
                axis: "y",
                theme: $(o).data('scroll_theme'),
                scrollInertia: 300
            });
        });

        $(".berocket_aapf_widget_selected_area").on('click', 'a', function (event){
            event.preventDefault();
            $obj = $(this);
            el_type = $obj.data('el_type');
            if ( el_type == 'checkbox' ) {
                $('#'+$obj.data('el_id')+'-styler').click();
            } else if ( el_type == 'radio' ) {
                $('#'+$obj.data('el_id')+'-styler').reset();
            } else if ( el_type == 'select' ) {
                $('#'+$obj.data('el_id')+' option:selected').prop('checked', false);
            } else if ( el_type == 'slider' ) {
                $slider = $('#'+$obj.data('el_id')).closest('li').find('.berocket_filter_slider');

                val1 = parseFloat($slider.data('min'));
                val2 = parseFloat($slider.data('max'));

                if( $slider.hasClass('berocket_filter_price_slider') ){
                    val1 = val1.toFixed(2);
                    val2 = val2.toFixed(2);
                }

                $( '#'+$slider.data('fields_1') ).val( val1 );
                $( '#'+$slider.data('fields_2') ).val( val2 );

                $slider.slider( "values", [ val1, val2 ] );

                updateProducts();
            }
        });

        // Option to take control over (default) sorting, make it AJAXy and work with filters
        if( the_ajax_script.control_sorting ) {
            $(document).on('submit', the_ajax_script.ordering_class, function (event) {
                event.preventDefault();
            });
            $(document).on('change', 'select.orderby', function (event) {
                event.preventDefault();
                updateProducts(true);
            });
        }

        aapf_action_init();

        $(document).on('click', '.berocket_aapf_widget_update_button', function (event) {
            event.preventDefault();
            updateProducts(true);
        });

        update_data_containers();
        update_selected_area();

        $(document).on('click', '.berocket_label_widgets', function(event) {
            if( $(this).prev('input').attr('type') == 'checkbox' || $(this).prev('input').attr('type') == 'radio' ) {
                event.preventDefault();
                event.stopPropagation();
                $(this).prev('input').trigger('change');
            }
        });

        $('.berocket_aapf_widget .berocket_widget_show_values').click(function(event)
        {
            event.preventDefault();
            var widget_block = $(this).parents('ul.berocket_aapf_widget');
            if(widget_block.hasClass('show_o_sel_values'))
            {
                widget_block.removeClass('show_o_sel_values');
                $(this).find('span').removeClass('hide_button').addClass('show_button');
            }
            else
            {
                widget_block.addClass('show_o_sel_values');
                $(this).find('span').removeClass('show_button').addClass('hide_button');
            }
        });
        window.onpopstate = function(event) {
            if ( event.state != null && event.state.BeRocket == 'Rules' ) {
                location.reload();
            }
        };
    });
})(jQuery);

function load_hash_test() {
    hash = location.hash;
    test_loc = location.href;
    reload = false;
    var filtersRegex = /filters=\((.*)\)/;
    if( ( filters_hash = filtersRegex.exec(hash) ) != null ) {
        if( location.hash != "")
            location.hash = "";
        if( test_loc.indexOf('?') != -1 ) {
            href_param = test_loc.split('?');
            if(href_param[1].indexOf('filters=') != -1) {
                href_params_array = href_param[1].split('&');
                for( var i = 0; i < href_params_array.length; i++ ) {
                    if( href_params_array[i].indexOf('filters=') != -1) {
                        test_loc = test_loc.replace(href_params_array[i],filters_hash[1]).replace(/#/,"").replace('&&','&');
                    }
                }
            } else {
                test_loc = test_loc.replace(/#/,"")+"&"+filters_hash[1];
            }
        } else {
            test_loc = test_loc.replace(/#/,"")+"?"+filters_hash[1];
        }
        reload = true;
    }
    var filtersRegex = /paged=([0-9]+)/;
    if( ( filters_hash = filtersRegex.exec(hash) ) != null ) {
        if( location.hash != "")
            location.hash = "";
        if( test_loc.indexOf('?') != -1 ) {
            href_param = test_loc.split('?');
            if(href_param[1].indexOf('paged=') != -1) {
                href_params_array = href_param[1].split('&');
                for( var i = 0; i < href_params_array.length; i++ ) {
                    if( href_params_array[i].indexOf('filters=') != -1) {
                        test_loc = test_loc.replace(href_params_array[i],filters_hash[0]).replace(/#/,"").replace('&&','&');
                    }
                }
            } else {
                test_loc = test_loc.replace(/#/,"")+"&"+filters_hash[0];
            }
        } else {
            test_loc = test_loc.replace(/#/,"")+"?"+filters_hash[0];
        }
        reload = true;
    }
    if(reload) {
        location.href = test_loc;
    }
}
load_hash_test();
