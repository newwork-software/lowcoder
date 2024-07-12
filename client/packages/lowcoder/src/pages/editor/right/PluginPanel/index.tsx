import { trans } from "i18n";
import { useMemo, useState } from "react";
import { PluginItem } from "./PluginItem";
import { useDispatch, useSelector } from "react-redux";
import { setCommonSettings } from "redux/reduxActions/commonSettingsActions";
import { getUser } from "redux/selectors/usersSelectors";
import { BluePlusIcon, CustomModal, DocLink, TacoButton, TacoInput, TacoSwitch } from "lowcoder-design";
import { getCommonSettings } from "redux/selectors/commonSettingSelectors";
import styled from "styled-components";
import { getNpmPackageMeta, normalizeNpmPackage, validateNpmPackage } from "comps/utils/remote";
import { ComListTitle, ExtensionContentWrapper } from "../styledComponent";
import { EmptyContent } from "components/EmptyContent";
import { messageInstance } from "lowcoder-design/src/components/GlobalInstances";
import { RemoteCompSource } from "@lowcoder-ee/types/remoteComp";

const URL_SOURCE_PREFIX = "url:";

const Footer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 24px;
  margin-bottom: 24px;
`;

export default function PluginPanel() {
  const dispatch = useDispatch();
  const [isAddModalShow, showAddModal] = useState(false);
  const [newPluginName, setNewPluginName] = useState("");
  const [newPluginSource, setNewPluginSource] = useState("npm");
  const user = useSelector(getUser);
  const commonSettings = useSelector(getCommonSettings);

  const plugins = useMemo(
    () =>
      (commonSettings?.npmPlugins || []).map((pluginIdentifier) => {
        const source: RemoteCompSource = pluginIdentifier.startsWith(URL_SOURCE_PREFIX) ? "url" : "npm";
        return {
          name: source === "url" ? pluginIdentifier.replace(URL_SOURCE_PREFIX, "") : normalizeNpmPackage(pluginIdentifier),
          source,
          raw: pluginIdentifier.replace(URL_SOURCE_PREFIX, ""),
        };
      }),
    [commonSettings?.npmPlugins]
  );

  const handleSetNpmPlugins = (nextNpmPlugins: string[]) => {
    dispatch(
      setCommonSettings({
        orgId: user.currentOrgId,
        data: {
          key: "npmPlugins",
          value: nextNpmPlugins,
        },
      })
    );
  };

  const handleAddNewPlugin = () => {
    if (!newPluginName) {
      return;
    }

    if (newPluginSource === "npm" && !validateNpmPackage(newPluginName)) {
      messageInstance.error(trans("npm.invalidNpmPackageName"));
      return;
    }

    if (
      commonSettings.npmPlugins?.find(
        (i) => normalizeNpmPackage(i) === normalizeNpmPackage(newPluginName)
      )
    ) {
      messageInstance.error(trans("npm.pluginExisted"));
      return;
    }

    const nextNpmPlugins = (commonSettings?.npmPlugins || []).concat(newPluginName);
    handleSetNpmPlugins(nextNpmPlugins);
    setNewPluginName("");
    setNewPluginSource("npm");
    showAddModal(false);
  };

  const handleRemove = (name: string) => {
    const nextNpmPlugins = commonSettings?.npmPlugins?.filter((i) => i !== name) || [];
    handleSetNpmPlugins(nextNpmPlugins);
  };

  const items = plugins.map((i) => {
      const options = i.source === "npm" ? { packageName: i.name,  packageVersion: "latest" } : { sourceUrl: i.name };
      return <PluginItem key={i.name} name={i.name} source={i.source} options={options} onRemove={() => handleRemove(i.raw)} />;
    });

  const empty = (
    <EmptyContent style={{ marginBottom: 8 }} text={trans("rightPanel.emptyPlugins")} />
  );

  return (
    <>
      <ComListTitle>{trans("rightPanel.pluginListTitle")}</ComListTitle>
      <ExtensionContentWrapper>{items.length > 0 ? items : empty}</ExtensionContentWrapper>
      <Footer>
        <TacoButton icon={<BluePlusIcon />} buttonType="blue" onClick={() => showAddModal(true)}>
          {trans("npm.addPluginBtnText")}
        </TacoButton>
      </Footer>
      <CustomModal
        centered
        title={trans("npm.addPluginModalTitle")}
        open={isAddModalShow}
        onOk={handleAddNewPlugin}
        onCancel={() => showAddModal(false)}
      >
        <span style={{ display: "block", marginBottom: "4px" }}>
          {trans("npm.pluginNameLabel")}
        </span>
        <TacoSwitch
          label="is Npm Plugin?"
          checked={newPluginSource === "npm"}
          onChange={(checked) => {
            setNewPluginSource(checked ? "npm" : "url");
          }}
        />
        <TacoInput
          autoFocus
          onPressEnter={() => {
            handleAddNewPlugin();
          }}
          onChange={(e) => {
            setNewPluginName(`${URL_SOURCE_PREFIX}${e.target.value}`);
          }}
          value={newPluginName}
        />
        <DocLink style={{ marginTop: 8 }} href={trans("docUrls.devNpmPlugin")}>
          {trans("docUrls.devNpmPluginText")}
        </DocLink>
      </CustomModal>
    </>
  );
}
