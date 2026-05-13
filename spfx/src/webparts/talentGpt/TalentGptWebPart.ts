import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import TalentGpt, { ITalentGptProps } from './components/TalentGpt';

export interface ITalentGptWebPartProps {
  apiBaseUrl: string;
  webpartHeight: number;
}

export default class TalentGptWebPart extends BaseClientSideWebPart<ITalentGptWebPartProps> {

  public render(): void {
    // Zero-size placeholder — the actual UI is position:fixed and floats over the page
    this.domElement.style.cssText = 'position:absolute;width:0;height:0;overflow:visible;';
    const element: React.ReactElement<ITalentGptProps> = React.createElement(
      TalentGpt,
      {
        apiBaseUrl: this.properties.apiBaseUrl || '',
        webpartHeight: this.properties.webpartHeight || 600,
        context: this.context,
      }
    );
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: 'TalentGPT Configuration',
          },
          groups: [
            {
              groupName: 'Backend',
              groupFields: [
                PropertyPaneTextField('apiBaseUrl', {
                  label: 'API Base URL',
                  description: 'Your Azure App Service URL — e.g. https://talentgpt-api.azurewebsites.net',
                  placeholder: 'https://your-api.azurewebsites.net',
                }),
              ],
            },
            {
              groupName: 'Appearance',
              groupFields: [
                PropertyPaneSlider('webpartHeight', {
                  label: 'Height (px)',
                  min: 400,
                  max: 1200,
                  step: 20,
                  showValue: true,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
