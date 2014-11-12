/**
 * ELASTICSEARCH CONFIDENTIAL
 * _____________________________
 *
 *  [2014] Elasticsearch Incorporated All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Elasticsearch Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Elasticsearch Incorporated
 * and its suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Elasticsearch Incorporated.
 */


package org.elasticsearch.marvel.agent.event;

import org.elasticsearch.cluster.node.DiscoveryNode;
import org.elasticsearch.common.xcontent.ToXContent;
import org.elasticsearch.common.xcontent.XContentBuilder;
import org.elasticsearch.marvel.agent.Utils;

import java.io.IOException;

public abstract class NodeEvent extends Event {

    protected final String event_source;

    public NodeEvent(long timestamp, String clusterName, String event_source) {
        super(timestamp, clusterName);
        this.event_source = event_source;
    }

    @Override
    public String type() {
        return "node_event";
    }

    protected abstract String event();

    @Override
    public XContentBuilder addXContentBody(XContentBuilder builder, ToXContent.Params params) throws IOException {
        super.addXContentBody(builder, params);
        builder.field("event", event());
        builder.field("event_source", event_source);
        return builder;
    }

    public static class ElectedAsMaster extends NodeEvent {


        private final DiscoveryNode node;

        public ElectedAsMaster(long timestamp, String clusterName, DiscoveryNode node, String event_source) {
            super(timestamp, clusterName, event_source);
            this.node = node;
        }

        @Override
        protected String event() {
            return "elected_as_master";
        }

        @Override
        public String conciseDescription() {
            return Utils.nodeDescription(node) + " became master";
        }

        // no need to render node as XContent as it will be done by the exporter.
    }

    public static class NodeJoinLeave extends NodeEvent {

        private final DiscoveryNode node;
        private boolean joined;

        public NodeJoinLeave(long timestamp, String clusterName, DiscoveryNode node, boolean joined, String event_source) {
            super(timestamp, clusterName, event_source);
            this.node = node;
            this.joined = joined;
        }

        @Override
        protected String event() {
            return (joined ? "node_joined" : "node_left");
        }

        @Override
        public String conciseDescription() {
            return Utils.nodeDescription(node) + (joined ? " joined" : " left");
        }

        @Override
        public XContentBuilder addXContentBody(XContentBuilder builder, ToXContent.Params params) throws IOException {
            super.addXContentBody(builder, params);
            builder.startObject("node");
            Utils.nodeToXContent(node, builder);
            builder.endObject();
            return builder;
        }
    }

}
