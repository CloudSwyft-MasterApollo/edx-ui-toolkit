define([
        'backbone',
        'jquery',
        'underscore',
        'text!../templates/dropdown.underscore'
    ],
    function( Backbone, $, _, DropdownTpl ) {
        'use strict';

        return Backbone.View.extend({
            tpl: _.template( DropdownTpl ),

            events: {
                'click .js-dropdown-button': 'clickOpenDropdown',
                'click a': 'analyticsLinkClick',
                'keydown': 'viewKeypress'
            },

            menu: '.dropdown-menu',

            key: {
                tab: 9,
                enter: 13,
                esc: 27,
                up: 38,
                down: 40
            },

            initialize: function( options ) {
                this.$parent = $(options.parent);
                this.render();
            },

            className: function() {
                return this.options.className;
            },

            render: function() {
                this.$el.html( this.tpl( this.model.toJSON() ) );
                this.$parent.replaceWith( this.$el );
                this.postRender();

                return this;
            },

            postRender: function() {
                this.$menu = this.$el.find('.dropdown-menu');
                this.$page = $(document);
                this.$dropdownButton = $('.js-dropdown-button');
                this.listenForPageKeypress();
            },

            analyticsLinkClick: function( event ) {
                var $link = $(event.target),
                    label = $link.hasClass('user-title') ? 'Dashboard' : $link.html().trim();

                /**
                 *  Add your own analytics tracking here
                 *  for example:
                 */
                window.analytics.track( 'user_dropdown.clicked', {
                    category: 'navigation',
                    label: label,
                    link: $link.attr('href')
                });
            },

            clickCloseDropdown: function( event, context ) {
                var $el = $(event.target);

                if ( !$el.hasClass('button-more') && !$el.hasClass('has-dropdown') ) {
                    context.closeDropdownMenus();
                }
            },

            clickOpenDropdown: function( event ) {
                event.preventDefault();

                this.openMenu( $(event.target) );
            },

            closeDropdownMenus: function( all ) {
                var $open;

                if ( all ) {
                    // Close all open, usually from ESC or doc click
                    $open = this.$page.find( this.menu );
                } else {
                    // Closing one for another
                    $open = this.$page.find( this.menu ).not( ':focus' );
                }

                $open.removeClass( 'is-visible' )
                     .addClass( 'is-hidden' );

                this.$dropdownButton
                    .removeClass( 'is-active' )
                    .attr( 'aria-expanded', 'false' );
            },

            escKeypressHandler: function( event ) {
                var keyCode = event.keyCode;

                if ( keyCode === this.key.esc ) {
                    // When the ESC key is pressed, close all menus
                    this.closeDropdownMenus(true);
                }
            },

            focusFirstItem: function() {
                this.$menu.find('.action').first().focus();
            },

            handlerIsAction: function( key, $el ) {
                if ( key === this.key.up ) {
                    this.previousMenuItemLink( $el );
                } else if ( key === this.key.down ) {
                    this.nextMenuItemLink( $el );
                }
            },

            handlerIsButton: function( key ) {
                if ( key === this.key.down ) {
                    this.focusFirstItem();
                }
            },

            handlerIsMenu: function( key ) {
                if ( key === this.key.down ) {
                    this.focusFirstItem();
                } else if ( key === this.key.up ) {
                    this.$dropdownButton.focus();
                }
            },

            handlerPageClicks: function( context ) {
                // Only want 1 event listener for click.dropdown
                // on the page so unbind for instantiating
                this.$page.off( 'click.dropdown' );
                this.$page.on( 'click.dropdown', function( event ) {
                    context.clickCloseDropdown( event, context );
                });
            },

            viewKeypress: function( event ) {
                var keyCode = event.keyCode,
                    $el = $(event.target);

                if ( keyCode === this.key.up ||
                     keyCode === this.key.down ) {
                    // Prevent default behavior if one of our trigger keys
                    event.preventDefault();
                }

                if ( keyCode === this.key.tab && $el.hasClass('last') ) {
                    event.preventDefault();
                    this.$dropdownButton.focus();
                } else if ( keyCode === this.key.esc ) {
                    this.closeDropdownMenus();
                    this.$dropdownButton.focus();
                } else if ( $el.hasClass('action') ) {
                    // Key handlers for when a menu item has focus
                    this.handlerIsAction( keyCode, $el );
                } else if ( $el.hasClass('dropdown-menu') ) {
                    // Key handlers for when the menu itself has focus, before an item within it receives focus
                    this.handlerIsMenu( keyCode );
                } else if ( $el.hasClass('has-dropdown') ) {
                    // Key handlers for when the button that opens the menu has focus
                    this.handlerIsButton( keyCode );
                }
            },

            listenForPageKeypress: function() {
                this.$page.on( 'keydown', _.bind( this.escKeypressHandler, this ) );
            },

            nextMenuItemLink: function( $el ) {
                var items = this.$el.find('.dropdown-menu').children('.dropdown-item').find('.action'),
                    items_count = items.length -1,
                    index = items.index( $el ),
                    next = index + 1;

                if ( index === items_count ) {
                    this.$dropdownButton.focus();
                } else {
                    items.eq(next).focus();
                }
            },

            openMenu: function( $el ) {
                var $menu = this.$menu;

                if ( !$menu.hasClass( 'is-visible' ) ) {
                    $el.addClass( 'is-active' )
                       .attr( 'aria-expanded', 'true' );

                    $menu.removeClass( 'is-hidden' )
                        .addClass( 'is-visible' );

                    $menu.focus();
                    this.setOrientation();
                    this.handlerPageClicks( this );

                } else {
                    this.closeDropdownMenus();
                }
            },

            previousMenuItemLink: function( $el ) {
                var items = this.$el.find('.dropdown-menu').children('.dropdown-item').find('.action'),
                    index = items.index( $el ),
                    prev = index - 1;

                if ( index === 0 ) {
                    this.$dropdownButton.focus();
                } else {
                    items.eq(prev).focus();
                }
            },

            setOrientation: function() {
                var midpoint = $(window).width() / 2,
                    alignClass = ( this.$dropdownButton.offset().left > midpoint ) ? 'align-right' : 'align-left';

                this.$menu
                    .removeClass( 'align-left align-right' )
                    .addClass( alignClass );
            }
        });
    }
);
