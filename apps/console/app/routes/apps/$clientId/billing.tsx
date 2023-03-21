import { ButtonAnchor } from '@proofzero/design-system/src/atoms/buttons/ButtonAnchor'
import type { LinksFunction } from '@remix-run/cloudflare'
import { FaDiscord, FaGithub, FaTwitter } from 'react-icons/fa'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

import billingCSS from '~/assets/early/billing.css'

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: billingCSS,
    },
  ]
}

export default () => (
  <div className="pricing-wrap">
    <div className="pricing-column">
      <div className="pricing-card">
        <div className="pricing-wrapper">
          <h3 className="pricing-h3">Free</h3>
          <div className="pricing-details-wrap">
            <div className="pricing">$0</div>
          </div>
          <div className="pricing-check-wrap">
            <div className="pricing-check">
              <img
                src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                alt=""
                className="check-2"
              />
              <p className="pricing-text">Unlimited MAUs</p>
            </div>
            <div className="pricing-check">
              <img
                src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                alt=""
                className="check-2"
              />
              <p className="pricing-text">Custom Branding</p>
            </div>
            <div className="pricing-check">
              <img
                src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                alt=""
                className="check-2"
              />
              <p className="pricing-text">Wallet Login</p>
            </div>
            <div className="pricing-check">
              <img
                src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                alt=""
                className="check-2"
              />
              <p className="pricing-text">Social Logins</p>
            </div>
            <div className="pricing-check">
              <img
                src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                alt=""
                className="check-2"
              />
              <p className="pricing-text">Profile API</p>
            </div>
            <div className="pricing-check">
              <img
                src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                alt=""
                className="check-2"
              />
              <p className="pricing-text">Community Support</p>
            </div>
            <div className="separator dark"></div>
            <div className="pricing-check soon white">
              <div className="div-block-40 mr-4">
                <img
                  src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                  alt=""
                  className="check-2"
                />
                <p className="pricing-text">Email Login</p>
              </div>
              <div className="tag dark pricing">
                <p className="pricing-text white small dark">COMING SOON</p>
              </div>
            </div>
            <div className="pricing-check soon white">
              <div className="div-block-40 mr-4">
                <img
                  src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                  alt=""
                  className="check-2"
                />
                <p className="pricing-text">WebAuthn</p>
              </div>
              <div className="tag dark pricing">
                <p className="pricing-text white small dark">COMING SOON</p>
              </div>
            </div>
            <div className="pricing-check space">
              <p className="pricing-text">... and more</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="pricing-column">
      <div className="pricing-card purple">
        <div className="pricing-wrapper">
          <div className="heading-wrap">
            <h3 className="pricing-h3 white">PRO </h3>
            <div className="tag small dark pricing">
              <p className="pricing-text white small dark">BETA</p>
            </div>
          </div>
          <div className="pricing-details-wrap">
            <div className="pricing white">Early Access </div>
          </div>
          <div className="pricing-check-wrap">
            <div className="pricing-check spacing">
              <p className="pricing-text white">Everything in FREE and</p>
            </div>
            <div className="pricing-check">
              <img
                src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                alt=""
                className="check-2"
              />
              <p className="pricing-text white">White Labeling</p>
            </div>
            <div className="pricing-check">
              <img
                src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                alt=""
                className="check-2"
              />
              <p className="pricing-text white">Custom Domain</p>
            </div>
            <div className="pricing-check">
              <img
                src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                alt=""
                className="check-2"
              />
              <p className="pricing-text white">Expert Support</p>
            </div>
            <div className="separator"></div>
            <div className="pricing-check soon">
              <div className="div-block-40">
                <img
                  src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                  alt=""
                  className="check-2"
                />
                <p className="pricing-text white">Vaults</p>
              </div>
              <div className="tag">
                <p className="pricing-text white small">COMING SOON</p>
              </div>
            </div>
            <div className="pricing-check soon">
              <div className="div-block-40">
                <img
                  src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                  alt=""
                  className="check-2"
                />
                <p className="pricing-text white">CRM</p>
              </div>
              <div className="tag">
                <p className="pricing-text white small">COMING SOON</p>
              </div>
            </div>
            <div className="pricing-check soon">
              <div className="div-block-40">
                <img
                  src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                  alt=""
                  className="check-2"
                />
                <p className="pricing-text white">Smart Contracts</p>
              </div>
              <div className="tag">
                <p className="pricing-text white small">COMING SOON</p>
              </div>
            </div>
            <div className="pricing-check soon">
              <div className="div-block-40">
                <img
                  src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                  alt=""
                  className="check-2"
                />
                <p className="pricing-text white">Teams</p>
              </div>
              <div className="tag">
                <p className="pricing-text white small">COMING SOON</p>
              </div>
            </div>
            <div className="pricing-check soon">
              <div className="div-block-40">
                <img
                  src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                  alt=""
                  className="check-2"
                />
                <p className="pricing-text white">Analytics</p>
              </div>
              <div className="tag">
                <p className="pricing-text white small">COMING SOON</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="pricing-column">
      <div className="pricing-card">
        <div className="pricing-wrapper">
          <div className="heading-wrap">
            <h3 className="pricing-h3">ENTERPRISE </h3>
            <div className="tag small dark pricing">
              <p className="pricing-text white small dark">BETA</p>
            </div>
          </div>
          <div className="pricing-details-wrap">
            <div className="pricing">Contact Us</div>
          </div>
          <div className="pricing-check-wrap">
            <div className="pricing-check spacing">
              <p className="pricing-text">Everything in PRO and</p>
            </div>
            <div className="pricing-check">
              <img
                src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                alt=""
                className="check-2"
              />
              <p className="pricing-text">Organizations</p>
            </div>
            <div className="pricing-check">
              <img
                src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                alt=""
                className="check-2"
              />
              <p className="pricing-text">Custom Authorizations</p>
            </div>
            <div className="pricing-check">
              <img
                src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                alt=""
                className="check-2"
              />
              <p className="pricing-text">SOC2</p>
            </div>
            <div className="pricing-check">
              <img
                src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                alt=""
                className="check-2"
              />
              <p className="pricing-text">SSO/SAML</p>
            </div>
            <div className="pricing-check">
              <img
                src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                alt=""
                className="check-2"
              />
              <p className="pricing-text">Custom Migration</p>
            </div>
            <div className="pricing-check">
              <img
                src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                alt=""
                className="check-2"
              />
              <p className="pricing-text">Custom Invoicing</p>
            </div>
            <div className="pricing-check">
              <img
                src="https://uploads-ssl.webflow.com/5aa5deb2f3d89b000123c7dd/5cd24ca168db6560f9e01747_check.svg"
                alt=""
                className="check-2"
              />
              <p className="pricing-text">Enterprise Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="flex flex-col lg:flex-row lg:space-x-28 space-y-4 lg:space-y-0 m-2">
      <section className="flex-1">
        <div>
          <Text size="sm" weight="medium" className="mb-3 text-gray-700">
            Follow us for updates
          </Text>

          <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-2">
            <ButtonAnchor key="twitter" href="https://twitter.com/rollupid">
              <FaTwitter className="text-base text-[#1D9BF0]" />

              <Text>Twitter</Text>
            </ButtonAnchor>

            <ButtonAnchor key="discord" href="https://discord.gg/rollupid">
              <FaDiscord className="text-base text-[#5865F2]" />

              <Text>Discord</Text>
            </ButtonAnchor>

            <ButtonAnchor
              key="github"
              href="https://github.com/proofzero/rollupid"
            >
              <FaGithub className="text-base" />

              <Text>GitHub</Text>
            </ButtonAnchor>
          </div>
        </div>
      </section>
    </div>
  </div>
)
