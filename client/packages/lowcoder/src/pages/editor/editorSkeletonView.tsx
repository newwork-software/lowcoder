import Header from "pages/common/header";
import React, {lazy} from "react";
import {
  Body,
  EditorContainer,
  Height100Div,
} from "pages/common/styledComponent";
import { getPanelStatus, getEditorModeStatus, getPanelStyle } from "util/localStorageUtil";
// import { BottomSkeleton } from "pages/editor/bottom/BottomContent";
// import RightPanel from "pages/editor/right/RightPanel";
import _ from "lodash";

import styled from "styled-components";
import { default as Skeleton } from "antd/es/skeleton";
import { default as Spin } from "antd/es/spin";
import { useTemplateViewMode, useUserViewMode } from "util/hooks";
import { ProductLoading } from "components/ProductLoading";
import { default as LoadingOutlined } from "@ant-design/icons/LoadingOutlined";

const BottomSkeleton = lazy(() => import("pages/editor/bottom/BottomContent").then(module => ({default: module.BottomSkeleton})));
const RightPanel = lazy(() => import('pages/editor/right/RightPanel'));
const LeftPanel = lazy(() => import("pages/common/styledComponent").then(module =>({default: module.LeftPanel})));
const MiddlePanel = lazy(() => import("pages/common/styledComponent").then(module =>({default: module.MiddlePanel})));

const StyledSkeleton = styled(Skeleton)`
  padding: 16px;
`;

const StyledSpin = styled(Spin)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f5f5f6;
  height: 100%;
`;

const SiderStyled = styled.div`
  height: calc(100vh - 48px);
  width: 40px;
  background-color: #373945;
`

export const EditorLoadingSpin = (props: { height?: string | number }) => {
  const { height = "100vh" } = props;
  return (
    <div style={{ height: height }}>
      <StyledSpin size="large" indicator={<LoadingOutlined spin />}/>
    </div>
  );
};

export default function EditorSkeletonView() {
  const panelStatus = getPanelStatus();
  const editorModeStatus = getEditorModeStatus();
  const panelStyle = getPanelStyle();
  const isUserViewMode = useUserViewMode();
  const isTemplate = useTemplateViewMode();

  if (isUserViewMode) {
    return <ProductLoading hideHeader={isTemplate} />;
  }

  return (
    <>
      <Height100Div>
        {/* <Header
          panelStatus={panelStatus}
          togglePanel={_.noop}
          editorModeStatus={editorModeStatus}
          toggleEditorModeStatus={_.noop}
        /> */}
        <Body>
          <SiderStyled />
          {panelStatus.left && (
            <LeftPanel
              collisionStatus={false}
              toggleCollisionStatus={_.noop}
            >
              <StyledSkeleton active paragraph={{ rows: 10 }} />
            </LeftPanel>
          )}
          <MiddlePanel>
            <EditorContainer>
              <EditorLoadingSpin />
            </EditorContainer>
            {panelStatus.bottom && (
              <div style={{ height: panelStyle.bottom.h + "px" }}>
                <BottomSkeleton />
              </div>
            )}
          </MiddlePanel>
          {panelStatus.right && (
            <RightPanel
              showPropertyPane={false}
              onCompDrag={_.noop}
              onTabChange={_.noop}
            />
          )}
        </Body>
      </Height100Div>
    </>
  );
}
