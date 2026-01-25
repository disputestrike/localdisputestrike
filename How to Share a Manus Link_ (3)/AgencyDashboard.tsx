            </CardContent>
          </Card>

          {/* Letters Generated */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-500" />
                Letters Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalLetters}</div>
              <p className="text-sm text-gray-500 mt-1">
                This month
              </p>
            </CardContent>
          </Card>

          {/* Active Disputes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                Active Disputes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.activeDisputes}</div>
              <p className="text-sm text-gray-500 mt-1">
                Awaiting responses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Plan Info Banner */}
        <Card className="mb-8 bg-gradient-to-r from-slate-800 to-slate-900 text-white border-0">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {stats.planTier?.charAt(0).toUpperCase()}{stats.planTier?.slice(1)} Plan
                  </h3>
                  <p className="text-gray-300 text-sm">
                    ${planPrice}/month • {stats.clientSlotsIncluded} client slots
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {stats.clientSlotsUsed >= stats.clientSlotsIncluded * 0.8 && (
                  <Badge className="bg-yellow-500 text-black">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Running low on slots
                  </Badge>
                )}
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900" asChild>
                  <Link href="/agency-pricing">Upgrade Plan</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client List Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Your Clients</CardTitle>
                <CardDescription>
                  Click on a client to view their credit profile and manage disputes
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search clients..."
                    className="pl-10 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-orange-500 hover:bg-orange-600">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Client
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Client</DialogTitle>
                      <DialogDescription>
                        Add a new client to your agency. You have {stats.clientSlotsIncluded - stats.clientSlotsUsed} slots remaining.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="clientName">Full Name *</Label>
                        <Input
                          id="clientName"
                          placeholder="John Doe"
                          value={newClient.clientName}
                          onChange={(e) => setNewClient({ ...newClient, clientName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientEmail">Email</Label>
                        <Input
                          id="clientEmail"
                          type="email"
                          placeholder="john@example.com"
                          value={newClient.clientEmail}
                          onChange={(e) => setNewClient({ ...newClient, clientEmail: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientPhone">Phone</Label>
                        <Input
                          id="clientPhone"
                          placeholder="(555) 123-4567"
                          value={newClient.clientPhone}
                          onChange={(e) => setNewClient({ ...newClient, clientPhone: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddClient}
                        disabled={!newClient.clientName.trim() || createClient.isPending}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        {createClient.isPending ? "Adding..." : "Add Client"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {clientsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
                <p className="text-gray-500 mb-4">
                  Add your first client to start managing their credit disputes.
                </p>
                <Button onClick={() => setIsAddClientOpen(true)} className="bg-orange-500 hover:bg-orange-600">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Your First Client
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Letters</TableHead>
                      <TableHead>Disputes</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow 
                        key={client.id} 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleViewClient(client.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-orange-100 text-orange-600">
                                {client.clientName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{client.clientName}</p>
                              <p className="text-sm text-gray-500">Added {format(new Date(client.createdAt), 'MMM d, yyyy')}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {client.clientEmail && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Mail className="h-3 w-3" />
                                {client.clientEmail}
                              </div>
                            )}
                            {client.clientPhone && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Phone className="h-3 w-3" />
                                {client.clientPhone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={client.status === 'active' ? 'default' : 'secondary'}
                            className={client.status === 'active' ? 'bg-green-100 text-green-700' : ''}