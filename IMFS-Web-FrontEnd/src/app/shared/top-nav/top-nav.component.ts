import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/utility-services/authenication.service';
import { OktaService } from 'src/app/services/utility-services/okta.service';
import { TopNavEventData, TopNavItem } from '../../models/misc/misc.model';

import { ComponentVisibilityService } from '../../services/utility-services/component-visibility.service';
import { ConfigDataLoadedEvent } from '../../services/utility-services/config-data-loaded.event';

import { IMFSUtilityService } from '../../services/utility-services/imfs-utility-services';
import { ContentControllerService } from './../../services/controller-services/content-controller.service';
import { TopNavEvent } from './topnav.event';

@Component({
    selector: 'app-top-nav',
    templateUrl: './top-nav.component.html',
    styleUrls: ['./top-nav.component.scss'],
    animations: [
        trigger('slideUpDown', [
            state('collapsed', style({
                display: 'none'
            })),
            state('expanded', style({
                /*transform: 'translate3d(0, 100%, 0)',*/
                display: 'block'
            })),
            transition('collapsed => expanded', animate('400ms ease-in-out')),
            transition('expanded => collapsed', animate('400ms ease-in-out'))
        ]),
    ]
})
export class TopNavComponent implements OnInit {

    navItems: TopNavItem[];
    orpUrl: string;
    ORPVersion: string;
    public currentItem: TopNavItem;
    public currentSubItem: TopNavItem;
    public sideNavHidden = false;
    IMStaffRole = false;
    IMStaffAdminRole = false;
    ResellerStandardRole = false;
    @Output() sideNavHide = new EventEmitter();
    currentURL: string;

    constructor(
        private router: Router,
        private oktaService: OktaService,
        private configDataLoadedEvent: ConfigDataLoadedEvent,
        public contentControllerService: ContentControllerService,
        public componentVisibilityService: ComponentVisibilityService,
        private imfsUtilityService: IMFSUtilityService,
        private authenticationService: AuthenticationService,
        // private navigationService: NavigationService,
        private topNavEvent: TopNavEvent) {
        this.currentItem = new TopNavItem();
        this.currentSubItem = new TopNavItem();
        // this.topNavHidden = false;
        this.topNavEvent.on().subscribe((event: TopNavEventData) => {
            if (!event.open) {
                this.closeNav();
            }
        });
    }

    openSubitems(event: any, item: any) {
        this.navItems.forEach((navItem: TopNavItem) => {
            // if (item.name !== navItem.name && navItem.hasChildren) {
            //     navItem.itemState = 'collapsed';
            // }

            if(navItem.name==="Home")
            {
                this.router.navigate([navItem.route]);
            }

            if (item.name !== navItem.name) {
                navItem.itemState = 'collapsed';
            }
        });
        item.itemState = item.itemState === 'collapsed' ? 'expanded' : 'collapsed';
    }

    showRedirecting() {
        this.imfsUtilityService.showLoading('Redirecting');
    }

    closeNav() {
        // this.sideNavHidden = true;
        // this.sideNavHide.emit(this.sideNavHidden);
    }

    ngOnInit() {
        // this.configDataLoadedEvent.on().subscribe(data => {
        //     that.navItems = data.systemConfigData.navItems;
        //     that.orpUrl = data.systemConfigData.orpUrl;
        //     that.ORPVersion = data.systemConfigData.ConfigValues.IMFSVersion;
        // });

        if (this.oktaService.hasValidIdToken()) {
            if (this.authenticationService.userHasRole('ResellerStandard') || this.authenticationService.userHasRole('ResellerAdmin')) {
                this.ResellerStandardRole = true;
            }
        }
        this.loadSystemConfig();
        this.currentURL = this.router.url;
    }

    loadSystemConfig(){
        const that = this;
        that.contentControllerService.loadSystemConfig().subscribe(
            data => {
                if (this.ResellerStandardRole) {
                    const filteredItems = data.navItems.filter(obj => obj.name !== 'Settings');
                    that.navItems = data.navItems;
                }
                else {
                    that.navItems = data.navItems;
                }

            }
        );
    }

    selectCurrentItem(parentItem: TopNavItem, currentItem: TopNavItem) {
        const that = this;
        if (currentItem.dynamicLink) {
            // this.navigationService.GetDynamicLink(currentItem.route).subscribe(
            //     (result: any) => {
            //         if (result && result.dynamicLink) {
            //             window.open(result.dynamicLink, '_blank');
            //         }
            //     },
            //     (err: any) => {
            //         this.imfsUtilityService.hideLoading();
            //         this.imfsUtilityService.showToastr('error', 'Failed', 'Error saving quote');
            //     }
            // );
        } else {
            parentItem.itemState = 'expanded';
            that.currentItem = parentItem;
            that.currentSubItem = currentItem;

            if (currentItem.queryParam) {
                this.router.navigate([currentItem.route], { queryParams: currentItem.queryParam }); // normal link
            } else {
                this.router.navigate([currentItem.route]); // normal link
            }
            return;
        }
    }

    // closeNav() {
    //     this.sideNavHidden = true;
    //     this.sideNavHide.emit(this.sideNavHidden);
    // }

    // toggleNav() {
    //     this.sideNavHidden = !this.sideNavHidden;
    //     this.sideNavHide.emit(this.sideNavHidden);
    // }

    // itemAllowed(sideNavItem: SideNavItem) {
    //     const excludeRolesString: string = sideNavItem.excludeRoles;
    //     const includeRolesString: string = sideNavItem.includeRoles;
    //     const includeResourcesString: string = sideNavItem.includeResources;

    //     if (!includeRolesString && !excludeRolesString && !includeResourcesString) {
    //         return true;
    //     }
    //     if (includeRolesString) {
    //         const itemRoles: string[] = includeRolesString.split(',');
    //         return this.authorizationService.userHasAnyRole(itemRoles);
    //     }
    //     if (excludeRolesString) {
    //         const itemRoles: string[] = excludeRolesString.split(',');
    //         return !this.authorizationService.userHasAnyRole(itemRoles);
    //     }

    //     if (includeResourcesString) {
    //         const itemResources: string[] = includeResourcesString.split(',');
    //         return this.authorizationService.userAllowResource(itemResources);
    //     }
    //     return false;
    // }
}
