import { HiLink } from "react-icons/hi";
import styles from "./inviteCode.css";
import { Tooltip } from "flowbite-react";

export const links = () => [{ rel: "stylesheet", href: styles }];

type InviteHolder = {
  address: string;
  timestamp: number;
};

type InviteCodeProps = {
  invite: {
    code: string;
    holders: InviteHolder[];
    reservation: {
      address: string;
      data: object;
      expiration: number;
    };
  };
};

const InviteCode = ({ invite }: InviteCodeProps) => {
  return (
    <div>
      <h2 className="invite-header">Invite Friends</h2>
      {invite.code && (
        <div>
          <div className="invite-description">
            Share an invite link with your friends
          </div>
          <div className="invite-link">
            https://get.threeid.xyz/{invite.code}
          </div>
          <Tooltip
            content="Link copied!"
            trigger="click"
            animation="duration-1000"
          >
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `https://get.threeid.xyz/${invite.code}`
                );
              }}
              className="invite-link-btn"
            >
              <HiLink className="invite-link-img" />
              <div className="invite-link-text">Copy link</div>
            </button>
          </Tooltip>
          {/* TODO: add tooltip to show that link is copied */}
          <div className="invitees">
            <div className="invitees-prefix">Your Invitees:</div>
            <div className="invites-left-amount">
              Your invite has {3 - invite.holders.length || 0} uses left
            </div>
            {invite.holders.length ? (
              invite.holders.map((holder) => (
                <div key={holder.address} className="holder-wide">
                  <div className="holder-address">{holder.address}</div>
                  <div className="holder-timestamp">{holder.timestamp}</div>
                </div>
              ))
            ) : (
              <div className="placeholder-for-holders">
                Holders that use your invite link will show here.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteCode;
